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
```

Explanation: Add Physics helpers for AABB collision and basic kinematics
````write file="fantasy-race-adventure-222312-222321/game_frontend/src/game/core/Physics.js"
//
// Minimal physics helpers for runner
//

/** Axis-aligned bounding box intersection */
export function aabbIntersect(a, b) {
  return !(
    a.x + a.w < b.x ||
    a.x > b.x + b.w ||
    a.y + a.h < b.y ||
    a.y > b.y + b.h
  );
}

/** Apply vertical gravity/velocity to entity with floor clamp. */
export function applyVerticalMotion(entity, dt, { gravity = 2000, floorY = 320 }) {
  // entity has y, vy, h
  entity.vy = (entity.vy || 0) + gravity * dt;
  entity.y += entity.vy * dt;

  // floor collision
  const foot = entity.y + entity.h;
  if (foot >= floorY) {
    entity.y = floorY - entity.h;
    entity.vy = 0;
    entity.grounded = true;
  } else {
    entity.grounded = false;
  }
}

/** Clamp number between min and max. */
export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
```

Explanation: Add Renderer with parallax background and simple shapes for entities
````write file="fantasy-race-adventure-222312-222321/game_frontend/src/game/core/Renderer.js"
//
// Canvas renderer for the endless runner, with parallax layers and entity drawing
//

/** Draw background layers with simple gradients and repeating hills/lines. */
export function drawParallax(ctx, state) {
  const { width, height } = state.viewport;
  const t = state.time || 0;

  // Sky
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, 'rgba(37,99,235,0.25)');
  sky.addColorStop(1, 'rgba(255,255,255,0.0)');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  // Layer speeds
  const base = state.scrollX || 0;
  const layers = [
    { color: 'rgba(37,99,235,0.35)', speed: 0.2, height: height * 0.5 },
    { color: 'rgba(37,99,235,0.25)', speed: 0.4, height: height * 0.65 },
    { color: 'rgba(37,99,235,0.18)', speed: 0.6, height: height * 0.8 },
  ];

  layers.forEach((layer, idx) => {
    ctx.fillStyle = layer.color;
    const yBase = layer.height;
    // draw repeated rounded hills
    const hillW = 180;
    const offset = -((base * layer.speed) % hillW);
    for (let x = offset - hillW; x < width + hillW; x += hillW) {
      ctx.beginPath();
      const h = 40 + (idx * 14);
      ctx.moveTo(x, height);
      ctx.quadraticCurveTo(x + hillW / 2, yBase - h, x + hillW, height);
      ctx.closePath();
      ctx.fill();
    }
  });

  // Ground
  ctx.fillStyle = 'rgba(17,24,39,0.2)';
  ctx.fillRect(0, state.floorY, width, height - state.floorY);

  // Decorative moving lines on the ground
  ctx.strokeStyle = 'rgba(17,24,39,0.3)';
  ctx.lineWidth = 2;
  const lineGap = 40;
  const offset = -((base * 1.2) % lineGap);
  for (let x = offset; x < width + lineGap; x += lineGap) {
    ctx.beginPath();
    ctx.moveTo(x, state.floorY);
    ctx.lineTo(x + 12, state.floorY + 12);
    ctx.stroke();
  }
}

/** Draw player as a rounded rect placeholder. */
export function drawPlayer(ctx, p) {
  ctx.fillStyle = '#2563EB';
  const r = 8;
  roundRect(ctx, p.x, p.y, p.w, p.h, r);
  ctx.fill();

  // Facing mark
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillRect(p.x + p.w - 10, p.y + 8, 4, 8);
}

/** Draw a coin as a golden circle. */
export function drawCoin(ctx, c) {
  ctx.beginPath();
  ctx.arc(c.x + c.r, c.y + c.r, c.r, 0, Math.PI * 2);
  ctx.fillStyle = '#F59E0B';
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.stroke();

  // inner shine
  ctx.beginPath();
  ctx.arc(c.x + c.r, c.y + c.r, c.r * 0.55, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.stroke();
}

/** Draw obstacle as a dark block/triangle placeholder. */
export function drawObstacle(ctx, o) {
  ctx.fillStyle = 'rgba(17,24,39,0.85)';
  roundRect(ctx, o.x, o.y, o.w, o.h, 6);
  ctx.fill();
}

/** Draw power-up as a glowing square. */
export function drawPowerUp(ctx, p) {
  ctx.fillStyle = 'rgba(99,102,241,0.9)'; // indigo
  roundRect(ctx, p.x, p.y, p.w, p.h, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.strokeRect(p.x - 2, p.y - 2, p.w + 4, p.h + 4);
}

/** Utility to draw rounded rect path. */
function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}
```

Explanation: Add basic entity classes for Player, Coin, Obstacle, PowerUp
````write file="fantasy-race-adventure-222312-222321/game_frontend/src/game/entities/Player.js"
//
// Player entity with jump/slide/dash state
//
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

  /** Current speed including dash bonus. */
  getEffectiveSpeed() {
    if (this.dashTimer > 0) return this.speed * 1.6;
    return this.speed;
  }

  /** AABB for collision. */
  getBounds() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }
}
