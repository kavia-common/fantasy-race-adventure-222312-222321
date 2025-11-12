//
/* Minimal physics helpers for runner */

// PUBLIC_INTERFACE
export function aabbIntersect(a, b) {
  /** Axis-aligned bounding box intersection */
  return !(
    a.x + a.w < b.x ||
    a.x > b.x + b.w ||
    a.y + a.h < b.y ||
    a.y > b.y + b.h
  );
}

// PUBLIC_INTERFACE
export function applyVerticalMotion(entity, dt, { gravity = 2000, floorY = 320 }) {
  /** Apply vertical gravity/velocity to entity with floor clamp. */
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

// PUBLIC_INTERFACE
export function clamp(v, min, max) {
  /** Clamp number between min and max. */
  return Math.max(min, Math.min(max, v));
}
