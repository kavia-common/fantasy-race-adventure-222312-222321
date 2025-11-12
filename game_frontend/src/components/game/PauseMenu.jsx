import React, { useEffect, useRef } from 'react';
import { Button } from '../ui/Button';

// PUBLIC_INTERFACE
export function PauseMenu({ open, onResume, onRestart, onExit }) {
  /** Overlay pause menu with actions and initial focus for keyboard users. */
  const resumeRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        try { resumeRef.current?.focus(); } catch {}
      }, 0);
    }
  }, [open]);

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
          <Button ref={resumeRef} onClick={onResume} ariaLabel="Resume game">Resume</Button>
          <Button variant="secondary" onClick={onRestart} ariaLabel="Restart game">Restart</Button>
          <Button variant="ghost" onClick={onExit} ariaLabel="Exit game">Exit</Button>
        </div>
      </div>
    </div>
  );
}

export default PauseMenu;
