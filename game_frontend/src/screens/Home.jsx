import React, { useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useActions, useSelector, selectors } from '../state/store';
import { lobbyApi, authApi } from '../api/endpoints';
import { logger } from '../utils/logger';

// PUBLIC_INTERFACE
export function Home() {
  /** Home screen: greets user and provides quick actions. */
  const user = useSelector(selectors.user);
  const { setUser, setLobbyList } = useActions();

  useEffect(() => {
    // Fetch current session user and some lobbies
    (async () => {
      const me = await authApi.me();
      setUser(me);
      const lobbies = await lobbyApi.list();
      setLobbyList(lobbies);
      logger.debug('[home] loaded me and lobbies');
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card
      title={`Welcome${user?.name ? `, ${user.name}` : ''}`}
      footer={<span className="muted">Ocean Professional theme</span>}
    >
      <p className="muted">Dash into chaotic fun. Join a lobby, customize your style, and start running!</p>
      <div style={{ marginTop: 12 }}>
        <a href="#/lobby"><Button>Find Lobby</Button></a>
        <span style={{ marginInline: 6 }} />
        <a href="#/customize"><Button variant="secondary">Customize</Button></a>
      </div>
    </Card>
  );
}

export default Home;
