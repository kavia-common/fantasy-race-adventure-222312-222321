import React, { useEffect, useState } from 'react';
import { logger } from '../utils/logger';

// PUBLIC_INTERFACE
export function useHashRoute() {
  /** Hook that exposes current hash path and a navigate function. */
  const getPath = () => {
    const raw = window.location.hash || '#/';
    const path = raw.replace(/^#/, '') || '/';
    return path.startsWith('/') ? path : `/${path}`;
  };

  const [path, setPath] = useState(getPath());

  useEffect(() => {
    const onHashChange = () => {
      const p = getPath();
      logger.debug('[router] hashchange ->', p);
      setPath(p);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (to) => {
    const target = to.startsWith('#') ? to : `#${to}`;
    if (window.location.hash !== target) {
      window.location.hash = target;
    } else {
      // force trigger for same hash navigation
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    }
  };

  return { path, navigate };
}

// PUBLIC_INTERFACE
export function AppRouter({ routes, notFound: NotFound }) {
  /**
   * Simple router component that selects a matching route based on window.location.hash.
   * routes: [{ path: '/path', element: <Component/> }, ...]
   */
  const { path } = useHashRoute();
  const match = routes.find(r => r.path === path);
  const El = match ? () => match.element : NotFound || (() => <div className="container">Not Found</div>);
  return <El />;
}
