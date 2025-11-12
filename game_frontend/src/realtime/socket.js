import { getEnv } from '../config/env';
import { logger } from '../utils/logger';

/**
 * Resolve the WebSocket URL using env with sensible fallback.
 * - Uses REACT_APP_WS_URL if set
 * - Else derives ws(s) from current page origin
 */
function resolveWsUrl() {
  const { wsUrl } = getEnv();
  if (wsUrl && typeof wsUrl === 'string' && wsUrl.trim()) {
    return wsUrl.trim();
  }
  // derive from location
  const loc = window.location;
  const isHttps = loc.protocol === 'https:';
  const proto = isHttps ? 'wss:' : 'ws:';
  return `${proto}//${loc.host}/ws`;
}

/**
 * Utility: jitter value between +/- pct of base (e.g., 0.2 => +/-20%)
 */
function withJitter(baseMs, pct = 0.2) {
  const delta = baseMs * pct;
  const rand = (Math.random() * 2 - 1) * delta;
  return Math.max(0, Math.floor(baseMs + rand));
}

/**
 * Backoff strategy generator with cap.
 */
function createBackoff({ initial = 1000, factor = 2, max = 30000 } = {}) {
  let current = initial;
  return {
    next() {
      const v = current;
      current = Math.min(max, Math.floor(current * factor));
      return withJitter(v);
    },
    reset() {
      current = initial;
    },
  };
}

/**
 * PUBLIC_INTERFACE
 * A lightweight realtime socket with auto-reconnect, heartbeat, and pub/sub.
 * Consumers can subscribe to events and publish messages. Messages are JSON frames:
 *   { type: string, event?: string, data?: any, ...metadata }
 */
export class RealtimeSocket {
  /** Create an instance; does not connect until connect() is called. */
  constructor(options = {}) {
    this.url = options.url || resolveWsUrl();
    this.heartbeatIntervalMs = options.heartbeatIntervalMs ?? 15000; // send ping every 15s
    this.heartbeatTimeoutMs = options.heartbeatTimeoutMs ?? 10000; // if no pong within 10s, trigger reconnect
    this.backoff = createBackoff(options.backoff || { initial: 1000, factor: 1.8, max: 30000 });

    /** @type {WebSocket|null} */
    this.ws = null;
    this.status = 'idle'; // idle | connecting | open | closing | closed
    this._subscriptions = new Map(); // event -> Set<callback>
    this._wildcardSubs = new Set(); // Set<callback(msg)>
    this._pendingQueue = []; // messages buffered before open
    this._heartbeatTimer = null;
    this._awaitingPong = false;

    this._onOpen = this._onOpen.bind(this);
    this._onMessage = this._onMessage.bind(this);
    this._onClose = this._onClose.bind(this);
    this._onError = this._onError.bind(this);

    this._reconnectTimer = null;
    this._manuallyClosed = false;
  }

  /** Connect to the WebSocket server. Safe to call multiple times. */
  connect() {
    if (this.ws && (this.status === 'open' || this.status === 'connecting')) {
      return;
    }
    this._manuallyClosed = false;
    this.status = 'connecting';
    const url = this.url;
    logger.info('[ws] connecting to', url);
    try {
      this.ws = new WebSocket(url);
      this.ws.addEventListener('open', this._onOpen);
      this.ws.addEventListener('message', this._onMessage);
      this.ws.addEventListener('close', this._onClose);
      this.ws.addEventListener('error', this._onError);
    } catch (err) {
      logger.error('[ws] connect error', err);
      this._scheduleReconnect();
    }
  }

  /** Close the socket and prevent auto-reconnect. */
  close() {
    this._manuallyClosed = true;
    this._clearReconnect();
    this._stopHeartbeat();
    if (this.ws) {
      this.status = 'closing';
      try {
        this.ws.close();
      } catch (e) {
        // ignore
      }
      this.ws = null;
    }
    this.status = 'closed';
  }

  /** Publish/send a message; queues if not open yet. */
  send(msg) {
    const frame = typeof msg === 'string' ? msg : JSON.stringify(msg);
    if (this.ws && this.status === 'open') {
      try {
        this.ws.send(frame);
      } catch (err) {
        logger.warn('[ws] send failed, queueing', err);
        this._pendingQueue.push(frame);
      }
    } else {
      this._pendingQueue.push(frame);
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Subscribe to a named event. Returns an unsubscribe function.
   */
  subscribe(eventName, callback) {
    if (eventName === '*') {
      this._wildcardSubs.add(callback);
      return () => this._wildcardSubs.delete(callback);
    }
    if (!this._subscriptions.has(eventName)) {
      this._subscriptions.set(eventName, new Set());
    }
    const set = this._subscriptions.get(eventName);
    set.add(callback);
    return () => {
      set.delete(callback);
      if (set.size === 0) this._subscriptions.delete(eventName);
    };
  }

  /**
   * PUBLIC_INTERFACE
   * Subscribe to all events. Callback receives the parsed message object.
   */
  subscribeAll(callback) {
    this._wildcardSubs.add(callback);
    return () => this._wildcardSubs.delete(callback);
  }

  /**
   * PUBLIC_INTERFACE
   * Convenience to publish an event payload.
   */
  publish(eventName, data) {
    this.send({ type: 'event', event: eventName, data });
  }

  /** INTERNALS */

  _onOpen() {
    logger.info('[ws] connected');
    this.status = 'open';
    this.backoff.reset();
    // flush queue
    const q = this._pendingQueue.splice(0, this._pendingQueue.length);
    q.forEach((frame) => {
      try {
        this.ws?.send(frame);
      } catch (e) {
        logger.warn('[ws] failed sending queued frame', e);
      }
    });
    this._startHeartbeat();
    this._emitLocal('socket.open', { url: this.url });
  }

  _onMessage(ev) {
    let msg;
    try {
      msg = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data;
    } catch (e) {
      logger.debug('[ws] non-JSON message', ev.data);
      return;
    }
    // if heartbeat pong
    if (msg && msg.type === 'pong') {
      this._awaitingPong = false;
      return;
    }
    // notify subs
    if (msg && typeof msg.event === 'string') {
      this._emit(msg.event, msg.data, msg);
    } else if (msg && typeof msg.type === 'string') {
      this._emit(msg.type, msg.data, msg);
    } else {
      // wildcard only
      this._emit('*', msg, msg);
    }
  }

  _onClose(ev) {
    logger.warn('[ws] closed', ev?.code, ev?.reason || '');
    this.status = 'closed';
    this._stopHeartbeat();
    this._emitLocal('socket.close', { code: ev?.code, reason: ev?.reason });

    if (!this._manuallyClosed) {
      this._scheduleReconnect();
    }
  }

  _onError(err) {
    logger.error('[ws] error', err);
    // Let close handler schedule reconnect
  }

  _scheduleReconnect() {
    if (this._reconnectTimer || this._manuallyClosed) return;
    const delay = this.backoff.next();
    logger.info(`[ws] reconnecting in ${delay}ms`);
    this._reconnectTimer = setTimeout(() => {
      this._reconnectTimer = null;
      this.connect();
    }, delay);
  }

  _clearReconnect() {
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer);
      this._reconnectTimer = null;
    }
  }

  _startHeartbeat() {
    this._stopHeartbeat();
    if (!this.heartbeatIntervalMs) return;
    this._heartbeatTimer = setInterval(() => {
      if (!this.ws || this.status !== 'open') return;
      if (this._awaitingPong) {
        logger.warn('[ws] heartbeat missed, forcing reconnect');
        try {
          this.ws.close();
        } catch {}
        return;
      }
      try {
        this._awaitingPong = true;
        this.ws.send(JSON.stringify({ type: 'ping', t: Date.now() }));
        // fail safe timeout; if no message resets awaitingPong, we'll reconnect on next tick
        setTimeout(() => {
          // if still awaiting after timeout, will be picked up by next interval
        }, this.heartbeatTimeoutMs);
      } catch (e) {
        logger.warn('[ws] heartbeat send failed', e);
      }
    }, this.heartbeatIntervalMs);
  }

  _stopHeartbeat() {
    if (this._heartbeatTimer) {
      clearInterval(this._heartbeatTimer);
      this._heartbeatTimer = null;
    }
    this._awaitingPong = false;
  }

  _emit(eventName, data, raw) {
    // exact subscribers
    const set = this._subscriptions.get(eventName);
    if (set && set.size) {
      set.forEach((cb) => {
        try {
          cb(data, raw);
        } catch (e) {
          logger.warn('[ws] subscriber error', e);
        }
      });
    }
    // wildcard
    if (this._wildcardSubs.size) {
      this._wildcardSubs.forEach((cb) => {
        try {
          cb(raw);
        } catch (e) {
          logger.warn('[ws] wildcard subscriber error', e);
        }
      });
    }
  }

  _emitLocal(eventName, data) {
    // use internal channel prefix
    this._emit(`__${eventName}`, data, { type: `__${eventName}`, data });
  }
}

/**
 * PUBLIC_INTERFACE
 * Singleton accessor for the app-level realtime socket.
 * Lazily creates and connects on first call.
 */
let _singleton = null;
export function getSocket() {
  if (!_singleton) {
    _singleton = new RealtimeSocket();
    _singleton.connect();
  }
  return _singleton;
}
