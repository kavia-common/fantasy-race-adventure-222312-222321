import React from 'react';
import '../App.css';
import { Navbar } from '../components/nav/Navbar';
import { HealthCheck } from '../components/health/HealthCheck';

// PUBLIC_INTERFACE
export function MainLayout({ sidebar, children }) {
  /** Main layout wrapping Navbar, sidebar, and content region. */
  return (
    <div className="app-shell">
      <Navbar />
      <div className="main-content container">
        <aside className="sidebar surface" aria-label="Sidebar">
          {sidebar || (
            <div style={{ padding: 16, display: 'grid', gap: 12 }}>
              <h3 style={{ marginBottom: 4 }}>Quick Access</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: '1.9' }}>
                <li><a href="#/customize">Character</a></li>
                <li><a href="#/lobby">Lobbies</a></li>
                <li><a href="#/leaderboard">Leaderboard</a></li>
              </ul>
              <div style={{ marginTop: 8 }}>
                <HealthCheck inline />
              </div>
            </div>
          )}
        </aside>
        <main className="surface" style={{ padding: 16, minHeight: 420 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
