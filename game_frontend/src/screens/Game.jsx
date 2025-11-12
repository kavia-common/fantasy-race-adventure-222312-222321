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
