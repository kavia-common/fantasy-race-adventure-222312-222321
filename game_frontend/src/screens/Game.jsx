import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useActions, useSelector, selectors } from '../state/store';
import { gameApi } from '../api/endpoints';
import { logger } from '../utils/logger';
import { useGameEngine } from '../hooks/useGameEngine';
import HUD from '../components/game/HUD';
import PauseMenu from '../components/game/PauseMenu';
import ControlsOverlay from '../components/game/ControlsOverlay';
import GameCanvas from '../components/game/GameCanvas';
import { getFeatureFlags } from '../config/featureFlags';

// Helper to read current mode from URL hash query (e.g., #/game?mode=user)
function readModeFromHash() {
  try {
    const raw = window.location.hash || '';
    const [, query = ''] = raw.split('?');
    const params = new URLSearchParams(query);
    const m = (params.get('mode') || 'classic').toLowerCase();
    return m === 'user' ? 'user' : 'classic';
  } catch {
    return 'classic';
  }
}

// PUBLIC_INTERFACE
export function Game() {
  /** Gameplay screen with either the built-in engine (default) or the user GameCanvas, with HUD and controls. */
  const game = useSelector(selectors.game);
  const { setGameState, updateGameState, clearGameState } = useActions();
  const [loading, setLoading] = useState(false);
  const matchId = game.matchId || 'local-1';

  // Mode management: classic (default) or user
  const [mode, setMode] = useState(readModeFromHash());

  useEffect(() => {
    const onHash = () => setMode(readModeFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const { canvasRef, paused, pause, resume, restart, stats } = useGameEngine();
  const isClassic = useMemo(() => mode !== 'user', [mode]);

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
    if (isClassic) {
      resume();
    }
  }

  async function onExit() {
    try {
      await gameApi.end(matchId);
    } finally {
      clearGameState();
      window.location.hash = '#/lobby';
    }
  }

  function setHashMode(next) {
    // Preserve path and replace/add mode
    try {
      const raw = window.location.hash || '#/game';
      const [path, query = ''] = raw.split('?');
      const params = new URLSearchParams(query);
      params.set('mode', next);
      window.location.hash = `${path}?${params.toString()}`;
    } catch {
      // fallback
      window.location.hash = `#/game?mode=${next}`;
    }
  }

  const flags = getFeatureFlags();
  const multiplayerEnabled = !!flags.get?.('multiplayer', flags.has('multiplayer'));

  return (
    <Card title="Game">
      {loading ? (
        <div className="muted">Loading match...</div>
      ) : (
        <div className="col" style={{ gap: 12 }}>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="muted">
              Match: {game.matchId || matchId} • Status: {game.status}
            </div>
            <div className="row" style={{ alignItems: 'center', gap: 8 }}>
              <div className="surface" style={{ padding: '6px 10px', borderRadius: 8 }}>
                <span className="muted" style={{ fontSize: 12, marginRight: 8 }}>Mode</span>
                <Button
                  variant={isClassic ? 'secondary' : 'ghost'}
                  size="sm"
                  ariaLabel="Use classic engine mode"
                  onClick={() => setHashMode('classic')}
                >
                  Classic
                </Button>
                <Button
                  variant={!isClassic ? 'secondary' : 'ghost'}
                  size="sm"
                  ariaLabel="Use user graphics mode"
                  onClick={() => setHashMode('user')}
                >
                  User
                </Button>
              </div>
              {multiplayerEnabled && <Button variant="ghost" onClick={() => (window.location.hash = '#/lobby')}>Lobby</Button>}
              {game.status !== 'running' ? (
                <Button onClick={onStart}>Start</Button>
              ) : (
                <Button variant="secondary" onClick={onExit}>Exit</Button>
              )}
            </div>
          </div>

          <div className="surface" style={{ position: 'relative', borderRadius: 12, overflow: 'hidden' }}>
            {isClassic ? (
              <>
                <canvas ref={canvasRef} aria-label="Game canvas" />
                <HUD stats={stats} paused={paused} onPause={pause} onResume={resume} />
                <ControlsOverlay />
                <PauseMenu open={paused} onResume={resume} onRestart={restart} onExit={onExit} />
              </>
            ) : (
              <>
                <GameCanvas />
                {/* Minimal inline controls reminder for user canvas */}
                <div
                  className="surface"
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    padding: '6px 10px',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                >
                  User Mode • Space to jump
                </div>
              </>
            )}
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
