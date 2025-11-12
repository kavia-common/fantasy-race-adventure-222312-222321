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
