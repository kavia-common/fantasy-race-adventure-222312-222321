//
/* Player entity with jump/slide/dash state */
import { applyVerticalMotion, clamp } from '../core/Physics';

// PUBLIC_INTERFACE
export class Player {
  /** Create a player at given x/y. Units are in screen pixels. */
  constructor({ x = 80, y = 0, w = 34, h = 48, floorY = 320 } = {}) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.vy = 0;
    this.speed = 260; // forward scroll speed baseline reference
    this.grounded = false;
    this.isSliding = false;
    this.slideTimer = 0;
    this.dashTimer = 0;
    this.floorY = floorY;
    this.jumpVel = -820;
    this.maxSlideTime = 0.5;
    this.maxDashTime = 0.2;
  }

  /** Update with input actions and dt. */
  update(dt, input) {
    // Slide
    if (input.slide && this.grounded) {
      this.isSliding = true;
      this.slideTimer = Math.min(this.maxSlideTime, this.slideTimer + dt);
      // reduce hitbox while sliding
      this.h = 30;
    } else {
      this.slideTimer = Math.max(0, this.slideTimer - dt);
      if (this.slideTimer <= 0) {
        this.isSliding = false;
        this.h = 48;
      }
    }

    // Jump
    if (input.jump && this.grounded) {
      this.vy = this.jumpVel;
      this.grounded = false;
    }

    // Dash (temporary speed boost)
    if (input.dash) {
      this.dashTimer = this.maxDashTime;
    }
    this.dashTimer = Math.max(0, this.dashTimer - dt);

    // Gravity
    applyVerticalMotion(this, dt, { floorY: this.floorY });

    // Clamp Y within sensible bounds
    this.y = clamp(this.y, 0, this.floorY - this.h);
  }

  /** PUBLIC_INTERFACE Current speed including dash bonus. */
  getEffectiveSpeed() {
    if (this.dashTimer > 0) return this.speed * 1.6;
    return this.speed;
  }

  /** PUBLIC_INTERFACE AABB for collision. */
  getBounds() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }
}
