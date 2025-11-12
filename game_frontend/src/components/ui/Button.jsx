import React from 'react';
import './button.css';

// PUBLIC_INTERFACE
export function Button({ children, variant = 'primary', size = 'md', ...props }) {
  /** Ocean styled button. Variants: primary, secondary, ghost */
  const className = `btn ${variant} ${size}`;
  return (
    <button className={className} {...props}>
      {children}
    </button>
  );
}
