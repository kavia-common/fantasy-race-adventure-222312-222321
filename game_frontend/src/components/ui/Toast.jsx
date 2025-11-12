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
      setTimeout(() => dismiss(id), timeout);
    }
  }
  function dismiss(id) {
    setToasts(prev => prev.filter(t => t.id !== id));
  }
  return { toasts, push, dismiss };
}

// PUBLIC_INTERFACE
export function ToastContainer({ toasts = [], onDismiss }) {
  /** Container rendering toasts */
  useEffect(() => {}, [toasts]);
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div className="toast surface" key={t.id} onClick={() => onDismiss?.(t.id)}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
