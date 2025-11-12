import React, { useEffect, useRef } from 'react';
import './drawer.css';

// PUBLIC_INTERFACE
export function Drawer({ open, side = 'right', width = 360, children, onClose, ariaLabel = 'Drawer panel' }) {
  /** Slide-over drawer from left or right with overlay semantics and ESC to close. */
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const onOverlayMouseDown = (e) => {
    if (e.target === overlayRef.current) onClose?.();
  };

  return (
    <div
      className={`drawer ${open ? 'open' : ''} ${side}`}
      style={{ ['--drawer-w']: `${width}px` }}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      ref={overlayRef}
      onMouseDown={onOverlayMouseDown}
    >
      <div className="drawer-panel surface" role="document" tabIndex={-1}>
        {children}
      </div>
    </div>
  );
}
