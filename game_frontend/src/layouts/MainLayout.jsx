import React from 'react';
import '../App.css';
import { Navbar } from '../components/nav/Navbar';
import { HealthCheck } from '../components/health/HealthCheck';
import LeaderboardList from '../components/leaderboard/LeaderboardList';
import { useActions, useSelector, selectors } from '../state/store';
import { useEffect } from 'react';
import { leaderboardApi } from '../api/endpoints';
import { ToastContainer } from '../components/ui/Toast';

// PUBLIC_INTERFACE
export function MainLayout({ sidebar, children }) {
  /** Main layout wrapping Navbar, sidebar, and content region. */
  const items = useSelector(selectors.leaderboardItems);
  const status = useSelector(selectors.leaderboardStatus);
  const toasts = useSelector(selectors.toasts);
  const { setLeaderboard, setLeaderboardStatus, dismissToast } = useActions();

  async function loadTop() {
    try {
      setLeaderboardStatus('loading');
      const list = await leaderboardApi.getTopScores({ limit: 5 });
      setLeaderboard(list);
      setLeaderboardStatus('loaded');
    } catch {
      setLeaderboardStatus('error');
    }
  }

  useEffect(() => {
    if (status === 'idle') {
      loadTop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div className="app-shell">
      <Navbar />
      <div className="main-content container">
        <aside className="sidebar surface" aria-label="Sidebar">
          {sidebar || (
            <div style={{ padding: 16, display: 'grid', gap: 12 }}>
              <h3 style={{ marginBottom: 4 }}>Quick Access</h3>
              <ul role="list" aria-label="Quick links" style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: '1.9', display: 'grid', gap: 4 }}>
                <li role="listitem"><a href="#/customize">Character</a></li>
                <li role="listitem"><a href="#/lobby">Lobbies</a></li>
                <li role="listitem"><a href="#/leaderboard">Leaderboard</a></li>
              </ul>

              <div className="surface" style={{ padding: 12, borderRadius: 12 }}>
                <LeaderboardList
                  title="Top 5"
                  items={items}
                  status={status}
                  compact
                  max={5}
                  onRefresh={loadTop}
                  ariaLabel="Sidebar leaderboard"
                />
              </div>

              <div style={{ marginTop: 4 }}>
                <HealthCheck inline />
              </div>
            </div>
          )}
        </aside>
        <main className="surface" style={{ padding: 16, minHeight: 420 }}>
          {children}
        </main>
      </div>
      <ToastContainer toasts={toasts} onDismiss={(id) => dismissToast(id)} />
    </div>
  );
}
