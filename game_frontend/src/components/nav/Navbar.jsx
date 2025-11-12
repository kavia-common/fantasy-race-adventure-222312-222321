import React from 'react';
import { useHashRoute } from '../../router/AppRouter';
import { Button } from '../ui/Button';
import './navbar.css';

// PUBLIC_INTERFACE
export function Navbar() {
  /** Top navigation bar with basic links and theme toggle hook-in via data-theme attribute. */
  const { navigate, path } = useHashRoute();

  return (
    <nav className="nav surface">
      <div className="nav-left">
        <span className="brand" onClick={() => navigate('/')} role="button" tabIndex={0}>
          Jump Squad
        </span>
        <div className="links">
          <a
            href="#/"
            className={path === '/' ? 'active' : ''}
            onClick={(e) => { e.preventDefault(); navigate('/'); }}
          >
            Home
          </a>
          <a
            href="#/lobby"
            className={path === '/lobby' ? 'active' : ''}
            onClick={(e) => { e.preventDefault(); navigate('/lobby'); }}
          >
            Lobby
          </a>
          <a
            href="#/customize"
            className={path === '/customize' ? 'active' : ''}
            onClick={(e) => { e.preventDefault(); navigate('/customize'); }}
          >
            Customize
          </a>
          <a
            href="#/leaderboard"
            className={path === '/leaderboard' ? 'active' : ''}
            onClick={(e) => { e.preventDefault(); navigate('/leaderboard'); }}
          >
            Leaderboard
          </a>
        </div>
      </div>
      <div className="nav-right">
        <Button variant="ghost" onClick={() => {
          const current = document.documentElement.getAttribute('data-theme') || 'light';
          document.documentElement.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
        }}>
          Theme
        </Button>
      </div>
    </nav>
  );
}
