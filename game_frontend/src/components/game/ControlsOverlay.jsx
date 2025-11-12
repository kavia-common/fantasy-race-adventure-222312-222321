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
