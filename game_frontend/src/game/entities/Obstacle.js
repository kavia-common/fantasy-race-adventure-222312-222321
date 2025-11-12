//
// Obstacle entity
//

// PUBLIC_INTERFACE
export class Obstacle {
  /** Obstacle rect at x,y with size w,h. */
  constructor({ x = 0, y = 0, w = 36, h = 40 } = {}) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.hit = false;
  }

  update(dt, scrollSpeed) {
    this.x -= scrollSpeed * dt;
  }

  getBounds() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }
}
