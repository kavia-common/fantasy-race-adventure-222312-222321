// 
// Input manager for keyboard and touch gestures
//

/**
 * Keys:
 *  - Jump: ArrowUp / Space / KeyW
 *  - Slide: ArrowDown / KeyS
 *  - Dash: KeyD / KeyL / ShiftRight / ShiftLeft
 */

// PUBLIC_INTERFACE
export class Input {
  /** 
   * Input manager that normalizes keyboard and touch to high-level actions.
   * Actions exposed on .actions: { jump:boolean, slide:boolean, dash:boolean, pause:boolean }
   */
  constructor(target = typeof window !== 'undefined' ? window : null) {
    this.target = target;
    this.actions = {
      jump: false,
      slide: false,
      dash: false,
      pause: false,
    };

    // Touch tracking
    this._touchStart = null;
    this._boundKeyDown = this._onKeyDown.bind(this);
    this._boundKeyUp = this._onKeyUp.bind(this);
    this._boundTouchStart = this._onTouchStart.bind(this);
    this._boundTouchMove = this._onTouchMove.bind(this);
    this._boundTouchEnd = this._onTouchEnd.bind(this);
  }

  /** Attach listeners. */
  attach() {
    if (!this.target) return;
    this.target.addEventListener('keydown', this._boundKeyDown);
    this.target.addEventListener('keyup', this._boundKeyUp);
    // Touch on document for broader catch
    document.addEventListener('touchstart', this._boundTouchStart, { passive: true });
    document.addEventListener('touchmove', this._boundTouchMove, { passive: true });
    document.addEventListener('touchend', this._boundTouchEnd, { passive: true });
  }

  /** Detach listeners. */
  detach() {
    if (!this.target) return;
    this.target.removeEventListener('keydown', this._boundKeyDown);
    this.target.removeEventListener('keyup', this._boundKeyUp);
    document.removeEventListener('touchstart', this._boundTouchStart);
    document.removeEventListener('touchmove', this._boundTouchMove);
    document.removeEventListener('touchend', this._boundTouchEnd);
  }

  /** Clear all actions. */
  reset() {
    this.actions.jump = false;
    this.actions.slide = false;
    this.actions.dash = false;
    this.actions.pause = false;
  }

  _onKeyDown(e) {
    const code = e.code || e.key || '';
    switch (code) {
      case 'ArrowUp':
      case 'Space':
      case 'KeyW':
        this.actions.jump = true;
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.actions.slide = true;
        break;
      case 'KeyD':
      case 'KeyL':
      case 'ShiftRight':
      case 'ShiftLeft':
        this.actions.dash = true;
        break;
      case 'Escape':
      case 'KeyP':
        this.actions.pause = true;
        break;
      default:
        break;
    }
  }

  _onKeyUp(e) {
    const code = e.code || e.key || '';
    switch (code) {
      case 'ArrowUp':
      case 'Space':
      case 'KeyW':
        this.actions.jump = false;
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.actions.slide = false;
        break;
      case 'KeyD':
      case 'KeyL':
      case 'ShiftRight':
      case 'ShiftLeft':
        this.actions.dash = false;
        break;
      case 'Escape':
      case 'KeyP':
        this.actions.pause = false;
        break;
      default:
        break;
    }
  }

  // Touch: interpret vertical swipe up as jump, down as slide, quick tap as jump, horizontal swipe as dash
  _onTouchStart(e) {
    const t = e.changedTouches?.[0];
    if (!t) return;
    this._touchStart = { x: t.clientX, y: t.clientY, t: performance.now() };
  }
  _onTouchMove(_e) {
    // no-op; evaluate on end for simplicity
  }
  _onTouchEnd(e) {
    const t = e.changedTouches?.[0];
    if (!t || !this._touchStart) return;
    const dx = t.clientX - this._touchStart.x;
    const dy = t.clientY - this._touchStart.y;
    const dt = performance.now() - this._touchStart.t;

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const isTap = absX < 8 && absY < 8 && dt < 220;

    if (isTap) {
      this.actions.jump = true;
      setTimeout(() => (this.actions.jump = false), 60);
    } else if (absY > absX) {
      if (dy < -20) {
        this.actions.jump = true;
        setTimeout(() => (this.actions.jump = false), 80);
      } else if (dy > 20) {
        this.actions.slide = true;
        setTimeout(() => (this.actions.slide = false), 150);
      }
    } else if (absX > 20) {
      this.actions.dash = true;
      setTimeout(() => (this.actions.dash = false), 120);
    }
    this._touchStart = null;
  }
}
