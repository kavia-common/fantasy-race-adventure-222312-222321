import React, { useEffect } from 'react';
import './modal.css';
import { Button } from './Button';

// PUBLIC_INTERFACE
export function Modal({ open, title, children, onClose, actions }) {
  /** Accessible modal dialog with overlay. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal surface">
        <div className="modal-header">
          <strong>{title}</strong>
          <Button variant="ghost" onClick={onClose} aria-label="Close">✕</Button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">
          {actions || <Button onClick={onClose}>Close</Button>}
        </div>
      </div>
    </div>
  );
}
