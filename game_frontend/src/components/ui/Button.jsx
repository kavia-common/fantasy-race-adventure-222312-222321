import React from 'react';
import './button.css';

// PUBLIC_INTERFACE
export const Button = React.forwardRef(function Button({ children, variant = 'primary', size = 'md', ariaLabel, ...props }, ref) {
  /** Ocean styled button. Variants: primary, secondary, ghost */
  const className = `btn ${variant} ${size}`;
  return (
    <button
      className={className}
      aria-label={ariaLabel}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});
