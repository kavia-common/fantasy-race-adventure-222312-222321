import React from 'react';
import '../App.css';
import { Navbar } from '../components/nav/Navbar';

// PUBLIC_INTERFACE
export function MainLayout({ sidebar, children }) {
  /** Main layout wrapping Navbar, sidebar, and content region. */
  return (
    <div className="app-shell">
      <Navbar />
      <div className="main-content container">
        <aside className="sidebar surface" aria-label="Sidebar">
          {sidebar || (
            <div style={{ padding: 16 }}>
              <h3 style={{ marginBottom: 8 }}>Quick Access</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: '1.9' }}>
                <li>Character</li>
                <li>Loadout</li>
                <li>Shop</li>
                <li>Events</li>
              </ul>
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
