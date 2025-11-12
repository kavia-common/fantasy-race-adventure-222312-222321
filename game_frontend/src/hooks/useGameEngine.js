import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Engine } from '../game/core/Engine';
import { Input } from '../game/core/Input';
import { aabbIntersect } from '../game/core/Physics';
import { drawParallax, drawPlayer, drawCoin, drawObstacle, drawPowerUp } from '../game/core/Renderer';
import { Player } from '../game/entities/Player';
import { Coin } from '../game/entities/Coin';
import { Obstacle } from '../game/entities/Obstacle';
import { PowerUp } from '../game/entities/PowerUp';

// PUBLIC_INTERFACE
export function useGameEngine() {
  /**
   * Hook that wires up the Engine to a canvas and exposes HUD state and controls.
   * Returns refs and controls for pause/resume and a stats object.
   */
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const inputRef = useRef(null);

  const [paused, setPaused] = useState(false);
  const [stats, setStats] = useState({
    score: 0,
    distance: 0,
    coins: 0,
    cpuDistance: 0,
    lead: 0, // positive = player ahead (px)
  });

  const stateRef = useRef({
    viewport: { width: 640, height: 360 },
    floorY: 320,
    time: 0,
    scrollX: 0,
    player: null,
    cpu: null,
    coins: [],
    obstacles: [],
    powerups: [],
    alive: true,
    speed: 260, // base scroll speed in px/s
  });

  // Resize canvas to device pixel ratio for crisp rendering
  const resizeCanvas = useCallback((canvas) => {
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
    if (s.player) s.player.floorY = s.floorY;
    if (s.cpu) s.cpu.floorY = s.floorY;
  }, []);

  const spawnInitial = useCallback(() => {
    const s = stateRef.current;
    s.player = new Player({ x: 80, y: s.floorY - 48, floorY: s.floorY });

    // CPU runner with slight speed boost based on aiDifficulty flag
    const cpu = new Player({ x: 80, y: s.floorY - 48, floorY: s.floorY });
    let boost = 1.02;
    try {
      const { getFeatureFlags } = require('../config/featureFlags');
      const flags = getFeatureFlags();
      const diff = (flags.get?.('aiDifficulty') || 'easy').toString();
      boost = diff === 'medium' ? 1.06 : 1.02;
    } catch {}
    cpu.speed = Math.floor(cpu.speed * boost);
    s.cpu = cpu;

    s.coins = [];
    s.obstacles = [];
    s.powerups = [];
    s.time = 0;
    s.scrollX = 0;
    s.alive = true;
    setStats({ score: 0, distance: 0, coins: 0, cpuDistance: 0, lead: 0 });
  }, []);

  const spawnLoop = useCallback((dt) => {
    const s = stateRef.current;
    // probabilistic spawns
    const worldSpeed = s.player?.getEffectiveSpeed?.() || s.speed;

    // Coins
    if (Math.random() < 0.025) {
      const y = s.floorY - 100 - Math.random() * 60;
      const x = s.viewport.width + 20;
      s.coins.push(new Coin({ x, y, r: 9 + Math.random() * 4 }));
    }
    // Obstacles
    if (Math.random() < 0.018) {
      const h = 28 + Math.random() * 30;
      const w = 24 + Math.random() * 24;
      const y = s.floorY - h;
      const x = s.viewport.width + 40 + Math.random() * 80;
      s.obstacles.push(new Obstacle({ x, y, w, h }));
    }
    // PowerUps
    if (Math.random() < 0.004) {
      const y = s.floorY - 140 - Math.random() * 60;
      const x = s.viewport.width + 20 + Math.random() * 60;
      s.powerups.push(new PowerUp({ x, y, w: 26, h: 26, type: 'dash' }));
    }

    // Update entities leftward
    const lists = [
      ...s.coins.map(c => ({ e: c, list: s.coins })),
      ...s.obstacles.map(o => ({ e: o, list: s.obstacles })),
      ...s.powerups.map(p => ({ e: p, list: s.powerups })),
    ];
    lists.forEach(({ e, list }) => {
      e.update(dt, worldSpeed);
      if (e.x < -100) {
        const idx = list.indexOf(e);
        if (idx >= 0) list.splice(idx, 1);
      }
    });
  }, []);

  // Define update and render functions for engine
  const systems = useMemo(() => {
    return {
      update: (dt, _state, _eng) => {
        const s = stateRef.current;
        s.time += dt;
        const input = inputRef.current?.actions || { jump: false, slide: false, dash: false, pause: false };

        // Pause toggle
        if (input.pause) {
          input.pause = false;
          if (!paused) {
            engineRef.current?.pause();
            setPaused(true);
            return;
          }
        }

        if (!s.player || !s.alive) return;
        s.player.update(dt, input);

        // CPU AI
        if (s.cpu) {
          const aiInput = { jump: false, slide: false, dash: false, pause: false };
          // find closest obstacle ahead of cpu
          let nearest = null;
          for (const o of s.obstacles) {
            if (o.x + o.w >= s.cpu.x && (nearest === null || o.x < nearest.x)) nearest = o;
          }
          if (nearest) {
            const dx = nearest.x - (s.cpu.x + s.cpu.w);
            const verticalOverlap = (s.cpu.y + s.cpu.h) > nearest.y && (s.cpu.y < nearest.y + nearest.h);
            if (dx < 140 && verticalOverlap && s.cpu.grounded) {
              aiInput.jump = true;
            }
          }
          s.cpu.update(dt, aiInput);
        }

        // scroll
        const worldSpeed = s.player.getEffectiveSpeed();
        const cpuSpeed = s.cpu ? s.cpu.getEffectiveSpeed() : worldSpeed;
        s.scrollX += dt * worldSpeed;

        // spawn/update entities
        spawnLoop(dt);

        // collision + scoring
        // coins
        for (const c of s.coins) {
          if (!c.collected && aabbIntersect(s.player.getBounds(), c.getBounds())) {
            c.collected = true;
            setStats(prev => ({ ...prev, coins: prev.coins + 1, score: prev.score + 10 }));
          }
        }
        s.coins = s.coins.filter(c => !c.collected);

        // powerups
        for (const p of s.powerups) {
          if (!p.collected && aabbIntersect(s.player.getBounds(), p.getBounds())) {
            p.collected = true;
            // dash boost by simulating input
            inputRef.current.actions.dash = true;
            setTimeout(() => (inputRef.current.actions.dash = false), 160);
            setStats(prev => ({ ...prev, score: prev.score + 20 }));
          }
        }
        s.powerups = s.powerups.filter(p => !p.collected);

        // obstacles
        for (const o of s.obstacles) {
          if (!o.hit && aabbIntersect(s.player.getBounds(), o.getBounds())) {
            o.hit = true;
            // MVP: reduce score and continue
            setStats(prev => ({ ...prev, score: Math.max(0, prev.score - 15) }));
          }
        }
        s.obstacles = s.obstacles.filter(o => !o.hit || o.x > -60);

        // distance and score over time
        setStats(prev => {
          const nextPlayerDist = prev.distance + worldSpeed * dt;
          const nextCpuDist = prev.cpuDistance + cpuSpeed * dt;
          return {
            ...prev,
            distance: nextPlayerDist,
            cpuDistance: nextCpuDist,
            lead: Math.round(nextPlayerDist - nextCpuDist),
            score: prev.score + Math.floor(2 * dt * 10), // small passive score
          };
        });
      },
      render: (ctx, _state, _eng) => {
        const s = stateRef.current;
        const { width, height } = s.viewport;

        // Clear
        ctx.clearRect(0, 0, width, height);

        // Background
        drawParallax(ctx, s);

        // Draw CPU first (amber) then player (blue)
        if (s.cpu) {
          ctx.save();
          ctx.fillStyle = '#F59E0B';
          const p = s.cpu;
          const r = 8;
          const rr = Math.min(r, p.w / 2, p.h / 2);
          ctx.beginPath();
          ctx.moveTo(p.x + rr, p.y);
          ctx.arcTo(p.x + p.w, p.y, p.x + p.w, p.y + p.h, rr);
          ctx.arcTo(p.x + p.w, p.y + p.h, p.x, p.y + p.h, rr);
          ctx.arcTo(p.x, p.y + p.h, p.x, p.y, rr);
          ctx.arcTo(p.x, p.y, p.x + p.w, p.y, rr);
          ctx.closePath();
          ctx.fill();
          // face mark
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
          ctx.fillRect(p.x + p.w - 10, p.y + 8, 4, 8);
          ctx.restore();
        }

        if (s.player) drawPlayer(ctx, s.player);
        s.coins.forEach(c => drawCoin(ctx, { ...c, y: c.y + (c._bobY || 0) }));
        s.obstacles.forEach(o => drawObstacle(ctx, o));
        s.powerups.forEach(p => drawPowerUp(ctx, p));
      },
    };
  }, [paused, spawnLoop]);

  // Start/stop lifecycle
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return () => {};
    // Ensure CSS size
    if (!canvas.style.width) {
      canvas.style.width = '100%';
      canvas.style.height = '320px';
      canvas.style.display = 'block';
      canvas.style.borderRadius = '12px';
    }
    resizeCanvas(canvas);

    const input = new Input(window);
    input.attach();
    inputRef.current = input;

    const eng = new Engine({ canvas, systems, initialState: stateRef.current });
    engineRef.current = eng;

    spawnInitial();
    eng.start();

    const onResize = () => resizeCanvas(canvas);
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      eng.stop();
      input.detach();
      if (engineRef.current === eng) engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resume when unpausing
  const resume = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.resume();
    setPaused(false);
  }, []);

  const pause = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.pause();
    setPaused(true);
  }, []);

  const restart = useCallback(() => {
    spawnInitial();
    setPaused(false);
    engineRef.current?.resume();
  }, [spawnInitial]);

  return {
    canvasRef,
    paused,
    pause,
    resume,
    restart,
    stats,
  };
}
