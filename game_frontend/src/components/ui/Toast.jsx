import React, { useEffect, useState } from 'react';
import './toast.css';

// PUBLIC_INTERFACE
export function useToast() {
  /** Hook returning push function and list of toasts. */
  const [toasts, setToasts] = useState([]);
  function push(message, timeout = 3000) {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message }]);
    if (timeout) {
      const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
      const effectiveTimeout = media && media.matches ? Math.min(timeout, 1200) : timeout;
      setTimeout(() => dismiss(id), effectiveTimeout);
    }
  }
  function dismiss(id) {
    setToasts(prev => prev.filter(t => t.id !== id));
  }
  return { toasts, push, dismiss };
}

// PUBLIC_INTERFACE
export function ToastContainer({ toasts = [], onDismiss }) {
  /** Container rendering toasts, using aria-live for announcements and respecting reduced motion. */
  useEffect(() => {}, [toasts]);
  return (
    <div className="toast-container" role="region" aria-live="polite" aria-relevant="additions text">
      {toasts.map(t => (
        <div
          className="toast surface"
          key={t.id}
          role="status"
          tabIndex={0}
          onClick={() => onDismiss?.(t.id)}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
