import React, { useEffect } from 'react';
import './App.css';
import { AppRouter } from './router/AppRouter';
import { MainLayout } from './layouts/MainLayout';
import { Card } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { getEnv } from './config/env';
import { getFeatureFlags } from './config/featureFlags';
import { logger } from './utils/logger';

function Home() {
  return (
    <Card title="Welcome to Jump Squad" footer={<span className="muted">Ocean Professional theme</span>}>
      <p className="muted">This is the home screen placeholder.</p>
      <div style={{ marginTop: 12 }}>
        <Button>Primary</Button>
        <span style={{ marginInline: 6 }} />
        <Button variant="secondary">Secondary</Button>
      </div>
    </Card>
  );
}
function Play() {
  return (
    <Card title="Play">
      <p className="muted">Game area will render here.</p>
    </Card>
  );
}
function Leaderboard() {
  return (
    <Card title="Leaderboard">
      <p className="muted">Leaderboard placeholder.</p>
    </Card>
  );
}

// PUBLIC_INTERFACE
function App() {
  /** Root app sets initial theme and mounts layout with router. */
  useEffect(() => {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');

    const env = getEnv();
    const flags = getFeatureFlags();
    logger.debug('[env]', env);
    logger.debug('[flags]', flags);
  }, []);

  const routes = [
    { path: '/', element: <Home /> },
    { path: '/play', element: <Play /> },
    { path: '/leaderboard', element: <Leaderboard /> },
  ];

  return (
    <MainLayout>
      <AppRouter routes={routes} />
    </MainLayout>
  );
}

export default App;
