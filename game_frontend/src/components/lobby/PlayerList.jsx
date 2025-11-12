import React from 'react';
import { Button } from '../ui/Button';

// PUBLIC_INTERFACE
export function PlayerList({ players = [], meId, onToggleReady, onStartGame, canStart }) {
  /** Show players in room with ready toggle and start control. */
  return (
    <div className="col" style={{ gap: 10 }} aria-label="Players list">
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>Players</strong>
        <Button onClick={onStartGame} disabled={!canStart} variant={canStart ? 'secondary' : 'ghost'} ariaLabel="Start game">
          Start Game
        </Button>
      </div>

      {players.length === 0 && <div className="muted">No players.</div>}

      {players.map((p) => (
        <div
          key={p.id}
          className="surface"
          style={{
            padding: 10,
            borderRadius: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          role="group"
          aria-label={`${p.name || p.id}, ${p.ready ? 'Ready' : 'Not ready'}`}
        >
          <div>
            <div style={{ fontWeight: 600 }}>{p.name || p.id}</div>
            <div className="muted" style={{ fontSize: 12 }}>
              {p.ready ? 'Ready' : 'Not ready'}
            </div>
          </div>
          <div>
            {p.id === meId ? (
              <Button ariaLabel={p.ready ? 'Set not ready' : 'Set ready'} onClick={() => onToggleReady?.(!p.ready)}>
                {p.ready ? 'Unready' : 'Ready'}
              </Button>
            ) : (
              <span className="muted" style={{ fontSize: 12 }} aria-label={p.ready ? 'Ready' : 'Not ready'}>
                {p.ready ? '✓' : '...'}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default PlayerList;
