import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getSocket, RealtimeSocket } from '../socket';
import { logger } from '../../utils/logger';
import { ALL_EVENTS } from '../events';

/**
 * Context that holds the app-level RealtimeSocket instance.
 */
const SocketContext = createContext(null);

/**
 * PUBLIC_INTERFACE
 * Provider that supplies a socket instance to descendants.
 * If no instance is provided, it uses the app singleton and ensures it's connected.
 */
export function SocketProvider({ socket, children }) {
  const instanceRef = useRef(socket || null);

  if (!instanceRef.current) {
    instanceRef.current = getSocket();
  }
  // ensure connection on mount
  useEffect(() => {
    const s = instanceRef.current;
    if (s && s.status !== 'open') s.connect();
  }, []);

  return <SocketContext.Provider value={instanceRef.current}>{children}</SocketContext.Provider>;
}

/**
 * PUBLIC_INTERFACE
 * Access the RealtimeSocket from context (or fallback to singleton if provider not mounted).
 */
export function useSocket() {
  const ctx = useContext(SocketContext);
  return ctx || getSocket();
}

/**
 * PUBLIC_INTERFACE
 * Subscribe to a named event and receive updates.
 * - eventName can be string or array of strings. Use ALL_EVENTS to listen to everything.
 * - Returns the latest payload for the first event in the list; for multi events, it will update on any.
 */
export function useSocketEvent(eventName, { initial = null, map = (x) => x } = {}) {
  const socket = useSocket();
  const [data, setData] = useState(initial);

  useEffect(() => {
    if (!socket) return () => {};
    const names = Array.isArray(eventName) ? eventName : [eventName];
    const unsubs = names.map((ev) =>
      socket.subscribe(ev, (payload, raw) => {
        try {
          const next = map(payload, raw);
          setData(next);
        } catch (e) {
          logger.warn('[useSocketEvent] mapper error', e);
        }
      })
    );
    return () => unsubs.forEach((u) => u && u());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, JSON.stringify(eventName)]);

  return data;
}

/**
 * PUBLIC_INTERFACE
 * Hook to subscribe to all messages (wildcard). Callback receives the raw message frame.
 */
export function useSocketAll(callback) {
  const socket = useSocket();
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    if (!socket) return () => {};
    const unsub = socket.subscribe(ALL_EVENTS, (raw) => {
      try {
        cbRef.current?.(raw);
      } catch (e) {
        logger.warn('[useSocketAll] callback error', e);
      }
    });
    return () => unsub && unsub();
  }, [socket]);
}

/**
 * PUBLIC_INTERFACE
 * Publish helper returning a stable function to send events.
 */
export function usePublish() {
  const socket = useSocket();
  return useMemo(() => {
    return (eventName, data) => {
      if (!(socket instanceof RealtimeSocket)) {
        logger.warn('[usePublish] socket not ready');
        return;
      }
      socket.publish(eventName, data);
    };
  }, [socket]);
}
