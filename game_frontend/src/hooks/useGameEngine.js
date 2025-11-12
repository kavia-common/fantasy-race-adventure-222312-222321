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
  });

  const stateRef = useRef({
    viewport: { width: 640, height: 360 },
    floorY: 320,
    time: 0,
    scrollX: 0,
    player: null,
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
  }, []);

  const spawnInitial = useCallback(() => {
    const s = stateRef.current;
    s.player = new Player({ x: 80, y: s.floorY - 48, floorY: s.floorY });
    s.coins = [];
    s.obstacles = [];
    s.powerups = [];
    s.time = 0;
    s.scrollX = 0;
    s.alive = true;
    setStats({ score: 0, distance: 0, coins: 0 });
  }, []);

  const spawnLoop = useCallback((dt) => {
    const s = stateRef.current;
    // probabilistic spawns based on time
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

        // scroll
        const worldSpeed = s.player.getEffectiveSpeed();
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
            // For MVP: reduce score and continue; could also end run
            setStats(prev => ({ ...prev, score: Math.max(0, prev.score - 15) }));
          }
        }
        s.obstacles = s.obstacles.filter(o => !o.hit || o.x > -60);

        // distance and score over time
        setStats(prev => ({
          ...prev,
          distance: prev.distance + worldSpeed * dt,
          score: prev.score + Math.floor(2 * dt * 10) // small passive score
        }));
      },
      render: (ctx, _state, _eng) => {
        const s = stateRef.current;
        const { width, height } = s.viewport;

        // Clear
        ctx.clearRect(0, 0, width, height);

        // Background
        drawParallax(ctx, s);

        // Entities
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
```

Explanation: Add HUD component to show score, distance, coins and pause button
````write file="fantasy-race-adventure-222312-222321/game_frontend/src/components/game/HUD.jsx"
import React from 'react';
import { Button } from '../ui/Button';

// PUBLIC_INTERFACE
export function HUD({ stats, paused, onPause, onResume }) {
  /** Heads-up display showing score, distance (m), and coins with pause/resume toggle. */
  const distanceM = Math.floor((stats?.distance || 0) / 3.6); // rough px->meters
  return (
    <div
      className="hud"
      style={{
        position: 'absolute',
        top: 8,
        left: 8,
        right: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        pointerEvents: 'none',
      }}
    >
      <div
        className="surface"
        style={{
          display: 'flex',
          gap: 12,
          padding: '6px 10px',
          borderRadius: 10,
          pointerEvents: 'auto',
          alignItems: 'center',
        }}
        aria-label="Game stats"
      >
        <span className="muted" style={{ fontSize: 13 }}>Score</span>
        <strong>{stats?.score ?? 0}</strong>
        <span className="muted" style={{ fontSize: 13, marginLeft: 8 }}>Distance</span>
        <strong>{distanceM} m</strong>
        <span className="muted" style={{ fontSize: 13, marginLeft: 8 }}>Coins</span>
        <strong>{stats?.coins ?? 0}</strong>
      </div>
      <div style={{ pointerEvents: 'auto' }}>
        {!paused ? (
          <Button variant="ghost" onClick={onPause} aria-label="Pause game">Pause ▮▮</Button>
        ) : (
          <Button onClick={onResume} aria-label="Resume game">Resume ▶</Button>
        )}
      </div>
    </div>
  );
}

export default HUD;
```

Explanation: Add PauseMenu overlay with restart option
````write file="fantasy-race-adventure-222312-222321/game_frontend/src/components/game/PauseMenu.jsx"
import React from 'react';
import { Button } from '../ui/Button';

// PUBLIC_INTERFACE
export function PauseMenu({ open, onResume, onRestart, onExit }) {
  /** Overlay pause menu with actions. */
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pause Menu"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        background: 'rgba(0,0,0,0.35)',
        zIndex: 5,
        borderRadius: 12,
      }}
    >
      <div className="surface" style={{ padding: 16, borderRadius: 12, minWidth: 260, textAlign: 'center' }}>
        <h3 style={{ marginBottom: 10 }}>Paused</h3>
        <div className="col" style={{ gap: 10 }}>
          <Button onClick={onResume}>Resume</Button>
          <Button variant="secondary" onClick={onRestart}>Restart</Button>
          <Button variant="ghost" onClick={onExit}>Exit</Button>
        </div>
      </div>
    </div>
  );
}

export default PauseMenu;
```

Explanation: Add ControlsOverlay with simple instructions for keyboard/touch
````write file="fantasy-race-adventure-222312-222321/game_frontend/src/components/game/ControlsOverlay.jsx"
import React from 'react';

// PUBLIC_INTERFACE
export function ControlsOverlay() {
  /** Non-interactive helper overlay to display control hints. */
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        bottom: 8,
        left: 8,
        right: 8,
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 12,
        color: 'var(--muted)',
        pointerEvents: 'none',
      }}
    >
      <div className="surface" style={{ padding: '6px 10px', borderRadius: 8, pointerEvents: 'auto' }}>
        Keyboard: Jump [W/Up/Space], Slide [S/Down], Dash [D/Shift], Pause [P/Esc]
      </div>
      <div className="surface" style={{ padding: '6px 10px', borderRadius: 8, pointerEvents: 'auto' }}>
        Touch: Tap/Swipe Up = Jump, Swipe Down = Slide, Swipe Side = Dash
      </div>
    </div>
  );
}

export default ControlsOverlay;
```

Explanation: Integrate the canvas-based endless runner into the Game screen using the new hook and UI components
````edit file="fantasy-race-adventure-222312-222321/game_frontend/src/screens/Game.jsx"
<<<<<<< SEARCH
import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useActions, useSelector, selectors } from '../state/store';
import { gameApi } from '../api/endpoints';
import { logger } from '../utils/logger';

// PUBLIC_INTERFACE
export function Game() {
  /** Gameplay screen shell; shows current match state and provides minimal controls. */
  const game = useSelector(selectors.game);
  const { setGameState, updateGameState, clearGameState } = useActions();
  const [loading, setLoading] = useState(false);
  const matchId = game.matchId || 'local-1';

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const state = await gameApi.getState(matchId);
        setGameState(state);
      } catch (e) {
        logger.warn('[game] failed to load state', e);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  function onStart() {
    updateGameState({ status: 'running', time: 0, matchId });
  }

  async function onExit() {
    try {
      await gameApi.end(matchId);
    } finally {
      clearGameState();
      window.location.hash = '#/lobby';
    }
  }

  return (
    <Card title="Game">
      {loading ? (
        <div className="muted">Loading match...</div>
      ) : (
        <div className="col" style={{ gap: 12 }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div className="muted">Match: {game.matchId || matchId} • Status: {game.status}</div>
            <div className="row">
              <Button variant="ghost" onClick={() => (window.location.hash = '#/lobby')}>Lobby</Button>
              {game.status !== 'running' ? (
                <Button onClick={onStart}>Start</Button>
              ) : (
                <Button variant="secondary" onClick={onExit}>Exit</Button>
              )}
            </div>
          </div>
          <div className="surface" style={{ minHeight: 240, borderRadius: 12, display: 'grid', placeItems: 'center' }}>
            <div className="muted">Game canvas placeholder</div>
          </div>
          <div className="muted" style={{ fontSize: 13 }}>
            Players: {Array.isArray(game.players) ? game.players.length : 0}
          </div>
        </div>
      )}
    </Card>
  );
}

export default Game;
=======
import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useActions, useSelector, selectors } from '../state/store';
import { gameApi } from '../api/endpoints';
import { logger } from '../utils/logger';
import { useGameEngine } from '../hooks/useGameEngine';
import HUD from '../components/game/HUD';
import PauseMenu from '../components/game/PauseMenu';
import ControlsOverlay from '../components/game/ControlsOverlay';

// PUBLIC_INTERFACE
export function Game() {
  /** Gameplay screen with canvas-based endless runner, HUD, and pause/resume. */
  const game = useSelector(selectors.game);
  const { setGameState, updateGameState, clearGameState } = useActions();
  const [loading, setLoading] = useState(false);
  const matchId = game.matchId || 'local-1';

  const { canvasRef, paused, pause, resume, restart, stats } = useGameEngine();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const state = await gameApi.getState(matchId);
        setGameState(state);
      } catch (e) {
        logger.warn('[game] failed to load state', e);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  function onStart() {
    updateGameState({ status: 'running', time: 0, matchId });
    resume();
  }

  async function onExit() {
    try {
      await gameApi.end(matchId);
    } finally {
      clearGameState();
      window.location.hash = '#/lobby';
    }
  }

  return (
    <Card title="Game">
      {loading ? (
        <div className="muted">Loading match...</div>
      ) : (
        <div className="col" style={{ gap: 12 }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div className="muted">Match: {game.matchId || matchId} • Status: {game.status}</div>
            <div className="row">
              <Button variant="ghost" onClick={() => (window.location.hash = '#/lobby')}>Lobby</Button>
              {game.status !== 'running' ? (
                <Button onClick={onStart}>Start</Button>
              ) : (
                <Button variant="secondary" onClick={onExit}>Exit</Button>
              )}
            </div>
          </div>

          <div className="surface" style={{ position: 'relative', borderRadius: 12, overflow: 'hidden' }}>
            <canvas ref={canvasRef} aria-label="Game canvas" />
            <HUD stats={stats} paused={paused} onPause={pause} onResume={resume} />
            <ControlsOverlay />
            <PauseMenu open={paused} onResume={resume} onRestart={restart} onExit={onExit} />
          </div>

          <div className="muted" style={{ fontSize: 13 }}>
            Players: {Array.isArray(game.players) ? game.players.length : 0}
          </div>
        </div>
      )}
    </Card>
  );
}

export default Game;
>>>>>>> REPLACE
