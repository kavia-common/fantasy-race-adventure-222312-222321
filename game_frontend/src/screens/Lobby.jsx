import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useActions, useSelector, selectors } from '../state/store';
import { lobbyApi } from '../api/endpoints';
import { logger } from '../utils/logger';

// PUBLIC_INTERFACE
export function Lobby() {
  /** Lobby browser/creation screen with minimal interactions. */
  const lobbyList = useSelector(selectors.lobbyList);
  const activeLobbyId = useSelector(selectors.activeLobbyId);
  const { setLobbyList, setActiveLobby } = useActions();
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    (async () => {
      const list = await lobbyApi.list();
      setLobbyList(list);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onCreate() {
    setCreating(true);
    try {
      const lobby = await lobbyApi.create({ name: `Lobby ${Math.floor(Math.random() * 99)}` });
      const list = await lobbyApi.list();
      setLobbyList(list);
      setActiveLobby(lobby.id);
    } catch (e) {
      logger.warn('[lobby] create failed', e);
    } finally {
      setCreating(false);
    }
  }

  async function onJoin(id) {
    await lobbyApi.join(id);
    setActiveLobby(id);
    window.location.hash = '#/game';
  }

  return (
    <Card title="Lobby">
      <div className="col" style={{ gap: 16 }}>
        <div className="row" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="muted">Browse open games or create your own.</div>
          <div className="row">
            <Button onClick={() => (window.location.hash = '#/')} variant="ghost">Back</Button>
            <Button onClick={onCreate} disabled={creating}>{creating ? 'Creating...' : 'Create Lobby'}</Button>
          </div>
        </div>

        <div className="col" style={{ gap: 12 }}>
          {lobbyList.length === 0 && <div className="muted">No lobbies yet. Be the first to create one!</div>}
          {lobbyList.map((lobby) => (
            <div key={lobby.id} className="surface" style={{ padding: 12, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{lobby.name}</div>
                <div className="muted" style={{ fontSize: 13 }}>{lobby.players}/{lobby.maxPlayers} players • {lobby.status}</div>
              </div>
              <div className="row">
                <Button variant="ghost" onClick={() => setActiveLobby(lobby.id)} aria-pressed={activeLobbyId === lobby.id}>
                  {activeLobbyId === lobby.id ? 'Selected' : 'Select'}
                </Button>
                <Button onClick={() => onJoin(lobby.id)}>Join</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export default Lobby;
