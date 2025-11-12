import React from 'react';
import { useHashRoute } from '../../router/AppRouter';
import { Button } from '../ui/Button';
import './navbar.css';

// PUBLIC_INTERFACE
export function Navbar() {
  /** Top navigation bar with basic links and theme toggle hook-in via data-theme attribute. */
  const { navigate, path } = useHashRoute();

  function onBrandKey(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate('/');
    }
  }

  return (
    <nav className="nav surface" aria-label="Primary navigation">
      <div className="nav-left">
        <span
          className="brand"
          onClick={() => navigate('/')}
          onKeyDown={onBrandKey}
          role="button"
          tabIndex={0}
          aria-label="Jump Squad Home"
        >
          Jump Squad
        </span>
        <div className="links" role="navigation" aria-label="Main links">
          <a
            href="#/"
            className={path === '/' ? 'active' : ''}
            aria-current={path === '/' ? 'page' : undefined}
            onClick={(e) => { e.preventDefault(); navigate('/'); }}
          >
            Home
          </a>
          <a
            href="#/lobby"
            className={path === '/lobby' ? 'active' : ''}
            aria-current={path === '/lobby' ? 'page' : undefined}
            onClick={(e) => { e.preventDefault(); navigate('/lobby'); }}
          >
            Lobby
          </a>
          <a
            href="#/customize"
            className={path === '/customize' ? 'active' : ''}
            aria-current={path === '/customize' ? 'page' : undefined}
            onClick={(e) => { e.preventDefault(); navigate('/customize'); }}
          >
            Customize
          </a>
          <a
            href="#/leaderboard"
            className={path === '/leaderboard' ? 'active' : ''}
            aria-current={path === '/leaderboard' ? 'page' : undefined}
            onClick={(e) => { e.preventDefault(); navigate('/leaderboard'); }}
          >
            Leaderboard
          </a>
        </div>
      </div>
      <div className="nav-right">
        <Button variant="ghost" ariaLabel="Toggle theme" onClick={() => {
          const current = document.documentElement.getAttribute('data-theme') || 'light';
          document.documentElement.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
        }}>
          Theme
        </Button>
      </div>
    </nav>
  );
}
