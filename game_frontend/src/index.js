import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { SocketProvider } from './realtime/hooks/useSocket';

// Ensure default hash route
if (!window.location.hash) {
  window.location.hash = '#/';
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SocketProvider>
      <div className="app-root">
        <App />
      </div>
    </SocketProvider>
  </React.StrictMode>
);
