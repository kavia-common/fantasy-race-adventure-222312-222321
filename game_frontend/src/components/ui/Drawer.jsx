import React from 'react';
import './drawer.css';

// PUBLIC_INTERFACE
export function Drawer({ open, side = 'right', width = 360, children }) {
  /** Slide-over drawer from left or right. */
  return (
    <div className={`drawer ${open ? 'open' : ''} ${side}`} style={{ ['--drawer-w']: `${width}px` }}>
      <div className="drawer-panel surface">
        {children}
      </div>
    </div>
  );
}
