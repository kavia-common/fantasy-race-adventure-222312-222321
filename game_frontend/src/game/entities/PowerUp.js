//
// PowerUp entity
//

// PUBLIC_INTERFACE
export class PowerUp {
  /** Power-up square at x,y with effect type. */
  constructor({ x = 0, y = 0, w = 28, h = 28, type = 'dash' } = {}) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.type = type;
    this.collected = false;
  }

  update(dt, scrollSpeed) {
    this.x -= scrollSpeed * dt;
  }

  getBounds() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }
}
