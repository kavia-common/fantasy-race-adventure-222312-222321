import React, { useEffect } from 'react';
import './App.css';
import { AppRouter } from './router/AppRouter';
import { MainLayout } from './layouts/MainLayout';
import { getEnv } from './config/env';
import { getFeatureFlags } from './config/featureFlags';
import { logger } from './utils/logger';

// Screens
import Home from './screens/Home';
import Lobby from './screens/Lobby';
import Game from './screens/Game';
import Customize from './screens/Customize';
import Leaderboard from './screens/Leaderboard';
import NotFound from './screens/NotFound';

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
    { path: '/lobby', element: <Lobby /> },
    { path: '/game', element: <Game /> },
    { path: '/customize', element: <Customize /> },
    { path: '/leaderboard', element: <Leaderboard /> },
  ];

  return (
    <MainLayout>
      <AppRouter routes={routes} notFound={NotFound} />
    </MainLayout>
  );
}

export default App;
