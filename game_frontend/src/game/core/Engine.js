//
// Simple game engine with requestAnimationFrame loop, pause/resume, and update/render pipeline
//

// PUBLIC_INTERFACE
export class Engine {
  /** 
   * A lightweight game engine coordinating update and render using requestAnimationFrame.
   * - Accepts systems: { update(dt, state), render(ctx, state) }
   * - Manages pause/resume, fixed time-step safety, and performance flags.
   */
  constructor({ canvas, systems = {}, initialState = {}, maxDelta = 1 / 15 } = {}) {
    this.canvas = canvas;
    this.ctx = canvas?.getContext ? canvas.getContext('2d') : null;

    this.update = systems.update || (() => {});
    this.render = systems.render || (() => {});
    this.state = { ...initialState };

    this.maxDelta = maxDelta; // cap delta to avoid big jumps on tab switching
    this._running = false;
    this._rafId = null;
    this._last = 0;

    this._onFrame = this._onFrame.bind(this);
  }

  /** Start the engine loop. Safe to call multiple times. */
  start() {
    if (this._running) return;
    this._running = true;
    this._last = performance.now();
    this._rafId = requestAnimationFrame(this._onFrame);
  }

  /** Pause the engine loop. */
  pause() {
    if (!this._running) return;
    this._running = false;
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  /** Resume from pause. */
  resume() {
    if (this._running) return;
    this._running = true;
    this._last = performance.now();
    this._rafId = requestAnimationFrame(this._onFrame);
  }

  /** Stop and cleanup. */
  stop() {
    this.pause();
  }

  /** Update state atomically. */
  setState(patch) {
    this.state = { ...this.state, ...(patch || {}) };
  }

  /** Internal frame handler. */
  _onFrame(ts) {
    if (!this._running) return;
    const dtMs = ts - this._last;
    this._last = ts;

    // Convert to seconds and clamp
    let dt = dtMs / 1000;
    if (dt > this.maxDelta) dt = this.maxDelta;

    try {
      this.update(dt, this.state, this);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[Engine] update error', e);
    }

    try {
      if (this.ctx) this.render(this.ctx, this.state, this);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[Engine] render error', e);
    }

    this._rafId = requestAnimationFrame(this._onFrame);
  }
}
