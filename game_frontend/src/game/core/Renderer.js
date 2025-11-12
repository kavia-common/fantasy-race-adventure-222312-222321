//
/* Canvas renderer for the endless runner, with parallax layers and entity drawing */

// PUBLIC_INTERFACE
export function drawParallax(ctx, state) {
  /** Draw background layers with simple gradients and repeating hills/lines. */
  const { width, height } = state.viewport;

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

// PUBLIC_INTERFACE
export function drawPlayer(ctx, p) {
  /** Draw player as a rounded rect placeholder. */
  ctx.fillStyle = '#2563EB';
  const r = 8;
  roundRect(ctx, p.x, p.y, p.w, p.h, r);
  ctx.fill();

  // Facing mark
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillRect(p.x + p.w - 10, p.y + 8, 4, 8);
}

// PUBLIC_INTERFACE
export function drawCoin(ctx, c) {
  /** Draw a coin as a golden circle. */
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

// PUBLIC_INTERFACE
export function drawObstacle(ctx, o) {
  /** Draw obstacle as a dark block placeholder. */
  ctx.fillStyle = 'rgba(17,24,39,0.85)';
  roundRect(ctx, o.x, o.y, o.w, o.h, 6);
  ctx.fill();
}

// PUBLIC_INTERFACE
export function drawPowerUp(ctx, p) {
  /** Draw power-up as a glowing square. */
  ctx.fillStyle = 'rgba(99,102,241,0.9)'; // indigo
  roundRect(ctx, p.x, p.y, p.w, p.h, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.strokeRect(p.x - 2, p.y - 2, p.w + 4, p.h + 4);
}

function roundRect(ctx, x, y, w, h, r) {
  /** Utility to draw rounded rect path. */
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}
