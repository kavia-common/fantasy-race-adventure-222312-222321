import React from 'react';
import './card.css';

// PUBLIC_INTERFACE
export function Card({ title, children, footer }) {
  /** Simple card with header and optional footer. */
  return (
    <div className="card surface">
      {title && <div className="card-header">{title}</div>}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}
