import React, { useEffect, useRef } from 'react';
import './modal.css';
import { Button } from './Button';

// PUBLIC_INTERFACE
export function Modal({ open, title, children, onClose, actions }) {
  /** Accessible modal dialog with overlay, focus trap, ESC to close, and initial focus on close button. */
  const overlayRef = useRef(null);
  const closeBtnRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    // focus the close button initially
    setTimeout(() => {
      try { closeBtnRef.current?.focus(); } catch {}
    }, 0);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const onOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose?.();
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={typeof title === 'string' ? title : 'Dialog'}
      ref={overlayRef}
      onMouseDown={onOverlayClick}
    >
      <div className="modal surface" role="document" tabIndex={-1}>
        <div className="modal-header">
          <strong id="modal-title">{title}</strong>
          <Button variant="ghost" onClick={onClose} ariaLabel="Close dialog" ref={closeBtnRef}>✕</Button>
        </div>
        <div className="modal-body" aria-describedby="modal-title">{children}</div>
        <div className="modal-footer">
          {actions || <Button onClick={onClose}>Close</Button>}
        </div>
      </div>
    </div>
  );
}
