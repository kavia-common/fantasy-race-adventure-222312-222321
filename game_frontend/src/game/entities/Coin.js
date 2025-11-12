//
// Coin entity
//

// PUBLIC_INTERFACE
export class Coin {
  /** Coin at x,y with radius r. */
  constructor({ x = 0, y = 0, r = 10 } = {}) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.collected = false;
    this._t = Math.random() * Math.PI * 2;
  }

  update(dt, scrollSpeed) {
    // Move left with world scroll
    this.x -= scrollSpeed * dt;

    // Bobbing effect
    this._t += dt * 4;
    const bob = Math.sin(this._t) * 2;
    this._bobY = bob;
  }

  getBounds() {
    return { x: this.x, y: this.y + (this._bobY || 0), w: this.r * 2, h: this.r * 2 };
  }
}
