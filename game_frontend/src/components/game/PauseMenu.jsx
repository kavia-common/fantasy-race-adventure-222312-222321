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
