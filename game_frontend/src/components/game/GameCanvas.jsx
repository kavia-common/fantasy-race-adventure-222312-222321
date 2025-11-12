import React, { useEffect, useRef } from 'react';

/**
 * PUBLIC_INTERFACE
 * GameCanvas - User-provided canvas runner visual.
 * This component renders a standalone animation loop with basic input handling (Space/W/Up to jump).
 * It is intentionally decoupled from the app engine and can be swapped on the Game screen when 'user' mode is selected.
 */
export default function GameCanvas() {
  const canvasRef = useRef(null);
  const loopRef = useRef({ raf: null, last: 0 });
  const stateRef = useRef({
    viewport: { width: 640, height: 360 },
    floorY: 320,
    player: { x: 80, y: 0, w: 36, h: 46, vy: 0, grounded: true },
    gravity: 2200,
    jumpVel: -880,
    scroll: 0,
    speed: 260,
  });

  // Resize for crisp rendering
  function resizeCanvas(canvas) {
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const s = stateRef.current;
    s.viewport.width = rect.width;
    s.viewport.height = rect.height;
    s.floorY = Math.floor(rect.height * 0.82);
    // Clamp player onto floor
    const p = s.player;
    p.y = Math.min(p.y, s.floorY - p.h);
  }

  // Simple draw helpers (kept minimal per provided graphics)
  function drawBackground(ctx, s) {
    const { width, height } = s.viewport;

    // soft sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, 'rgba(37,99,235,0.25)');
    sky.addColorStop(1, 'rgba(255,255,255,0.0)');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    // ground
    ctx.fillStyle = 'rgba(17,24,39,0.2)';
    ctx.fillRect(0, s.floorY, width, height - s.floorY);

    // simple moving lines
    ctx.strokeStyle = 'rgba(17,24,39,0.3)';
    ctx.lineWidth = 2;
    const gap = 42;
    const offset = -((s.scroll * 1.2) % gap);
    for (let x = offset; x < width + gap; x += gap) {
      ctx.beginPath();
      ctx.moveTo(x, s.floorY);
      ctx.lineTo(x + 12, s.floorY + 12);
      ctx.stroke();
    }
  }

  function drawPlayer(ctx, p) {
    const r = 8;
    ctx.fillStyle = '#2563EB';
    ctx.beginPath();
    const x = p.x, y = p.y, w = p.w, h = p.h;
    const rr = Math.min(r, w / 2, h / 2);
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
    ctx.fill();

    // face mark
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillRect(p.x + p.w - 10, p.y + 8, 4, 8);
  }

  // Input: Space/Up/W -> jump
  useEffect(() => {
    const onKeyDown = (e) => {
      const code = e.code || e.key || '';
      if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW') {
        const s = stateRef.current;
        const p = s.player;
        if (p.grounded) {
          p.vy = s.jumpVel;
          p.grounded = false;
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return () => {};
    // initial style for Ocean Pro block
    if (!canvas.style.width) {
      canvas.style.width = '100%';
      canvas.style.height = '320px';
      canvas.style.display = 'block';
      canvas.style.borderRadius = '12px';
    }
    resizeCanvas(canvas);

    const ctx = canvas.getContext('2d');
    const loop = loopRef.current;
    loop.last = performance.now();

    const tick = (ts) => {
      const s = stateRef.current;
      const dt = Math.min(0.066, (ts - loop.last) / 1000);
      loop.last = ts;

      // physics
      const p = s.player;
      p.vy += s.gravity * dt;
      p.y += p.vy * dt;

      const foot = p.y + p.h;
      if (foot >= s.floorY) {
        p.y = s.floorY - p.h;
        p.vy = 0;
        p.grounded = true;
      }

      s.scroll += s.speed * dt;

      // render
      ctx.clearRect(0, 0, s.viewport.width, s.viewport.height);
      drawBackground(ctx, s);
      drawPlayer(ctx, p);

      loop.raf = requestAnimationFrame(tick);
    };

    loop.raf = requestAnimationFrame(tick);

    const onResize = () => resizeCanvas(canvas);
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      if (loop.raf) cancelAnimationFrame(loop.raf);
      loop.raf = null;
    };
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <canvas ref={canvasRef} aria-label="User Game Canvas" />
      {/* Controls hint per Ocean Professional styling */}
      <div
        aria-hidden="true"
        className="surface"
        style={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          padding: '6px 10px',
          borderRadius: 8,
          fontSize: 12,
          color: 'var(--muted)',
        }}
      >
        Controls: Space/W/Up to Jump
      </div>
    </div>
  );
}
