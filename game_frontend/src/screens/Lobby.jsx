import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useActions, useSelector, selectors } from '../state/store';
import { lobbyApi } from '../api/endpoints';
import { logger } from '../utils/logger';
import { getFeatureFlags } from '../config/featureFlags';

// Ensure component imports are explicit (for linter)
import RoomList from '../components/lobby/RoomList';
import RoomCreateJoin from '../components/lobby/RoomCreateJoin';
import PlayerList from '../components/lobby/PlayerList';
import ChatPanel from '../components/lobby/ChatPanel';

// Lazy socket imports to avoid bundling/connecting when disabled
let usePublish, useSocket, useSocketEvent, RealtimeEvents;
try {
  const hooks = require('../realtime/hooks/useSocket');
  const events = require('../realtime/events');
  usePublish = hooks.usePublish;
  useSocket = hooks.useSocket;
  useSocketEvent = hooks.useSocketEvent;
  RealtimeEvents = events.RealtimeEvents;
} catch {
  usePublish = () => () => {};
  useSocket = () => null;
  useSocketEvent = () => null;
  RealtimeEvents = {};
}

// Generate a lightweight random id for optimistic entities
function genId() {
  return Math.random().toString(36).slice(2);
}

// PUBLIC_INTERFACE
export function Lobby() {
  /** Lobby browser/creation screen with realtime, fallbacks, and optimistic updates. */
  const flags = getFeatureFlags();
  const multiplayerEnabled = !!flags.get?.('multiplayer', flags.has('multiplayer'));

  // Always call hooks in consistent order
  const lobbyList = useSelector(selectors.lobbyList);
  const activeLobbyId = useSelector(selectors.activeLobbyId);
  const lobbyPlayers = useSelector(selectors.lobbyPlayers);
  const lobbyChat = useSelector(selectors.lobbyChat);
  const user = useSelector(selectors.user);

  const {
    setLobbyList, setActiveLobby, addLobby, updateLobby, removeLobby,
    setLobbyPlayers, updateLobbyPlayer, setReadyStatus, setLobbyChat, addLobbyChat, setLobbySocketStatus
  } = useActions();

  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const socket = useSocket();
  const publish = usePublish();

  // Live lobby list updates (no-op if socket hooks are inert)
  useSocketEvent(
    [RealtimeEvents.LOBBY_LIST, RealtimeEvents.LOBBY_CREATED, RealtimeEvents.LOBBY_UPDATED, RealtimeEvents.LOBBY_REMOVED],
    {
      initial: null,
      map: (payload, raw) => ({ payload, raw }),
    }
  );

  // Base data load + mark socket status
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const list = await lobbyApi.list();
        setLobbyList(list);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!socket) return;
    setLobbySocketStatus(socket.status);
    const onStatus = () => setLobbySocketStatus(socket.status);
    const int = setInterval(onStatus, 1000);
    return () => clearInterval(int);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  // Subscribe to specific events for updates
  useEffect(() => {
    if (!socket) return () => {};
    const unsubs = [
      socket.subscribe(RealtimeEvents.LOBBY_LIST, (list) => setLobbyList(Array.isArray(list) ? list : [])),
      socket.subscribe(RealtimeEvents.LOBBY_CREATED, (lobby) => addLobby(lobby)),
      socket.subscribe(RealtimeEvents.LOBBY_UPDATED, (lobby) => updateLobby(lobby)),
      socket.subscribe(RealtimeEvents.LOBBY_REMOVED, ({ id }) => removeLobby(id)),
      socket.subscribe(RealtimeEvents.LOBBY_JOINED, (data) => {
        if (data?.players) setLobbyPlayers(data.players);
        if (data?.lobbyId) setActiveLobby(data.lobbyId);
      }),
      socket.subscribe(RealtimeEvents.PLAYER_JOINED, (p) => updateLobbyPlayer(p)),
      socket.subscribe(RealtimeEvents.PLAYER_LEFT, (p) => {
        if (!p?.id) return;
        setLobbyPlayers(lobbyPlayers.filter(x => x.id !== p.id));
      }),
      socket.subscribe(RealtimeEvents.LOBBY_CHAT, (msg) => addLobbyChat({ ...msg, id: msg.id || genId(), ts: msg.ts || Date.now() })),
      socket.subscribe(RealtimeEvents.MATCH_STARTED, () => {
        window.location.hash = '#/game';
      }),
    ];
    return () => unsubs.forEach((u) => u && u());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, lobbyPlayers.length]);

  async function refreshList() {
    try {
      const list = await lobbyApi.list();
      setLobbyList(list);
    } catch (e) {
      logger.warn('[lobby] refresh failed', e);
    }
  }

  async function onCreate(payload) {
    setCreating(true);
    try {
      const optimistic = { id: `tmp-${genId()}`, name: payload?.name || 'Room', players: 1, maxPlayers: payload?.maxPlayers || 8, status: 'open', _optimistic: true };
      addLobby(optimistic);
      publish('create_room', payload);

      const room = await lobbyApi.create(payload);
      removeLobby(optimistic.id);
      addLobby(room);

      publish(RealtimeEvents.LOBBY_CREATED, room);
      setActiveLobby(room.id);
    } catch (e) {
      logger.warn('[lobby] create failed', e);
    } finally {
      setCreating(false);
    }
  }

  async function onJoin(id) {
    try {
      publish('join_room', { roomId: id });
      await lobbyApi.join(id);
      setActiveLobby(id);
    } catch (e) {
      logger.warn('[lobby] join failed', e);
    }
  }

  function onToggleReady(next) {
    setReadyStatus(user?.id || 'guest', next);
    publish('ready_status', { lobbyId: activeLobbyId, playerId: user?.id || 'guest', ready: !!next });
  }

  function onStartGame() {
    publish('start_game', { lobbyId: activeLobbyId });
  }

  function onSendChat(text) {
    const msg = { id: genId(), user: user?.name || 'Guest', text, ts: Date.now() };
    addLobbyChat(msg);
    publish('chat_message', { lobbyId: activeLobbyId, text });
  }

  const myPlayer = useMemo(() => {
    const id = user?.id || 'guest';
    return lobbyPlayers.find((p) => p.id === id) || { id, name: user?.name || 'Guest', ready: false };
  }, [lobbyPlayers, user]);

  const canStart = useMemo(() => {
    if (!lobbyPlayers.length) return false;
    return lobbyPlayers.every((p) => !!p.ready);
  }, [lobbyPlayers]);

  // Render branch: show disabled notice if multiplayer off
  if (!multiplayerEnabled) {
    return (
      <Card title="Lobby">
        <div className="col" style={{ gap: 12 }}>
          <div className="surface" style={{ padding: 12, borderRadius: 12 }}>
            Multiplayer is currently disabled.
          </div>
          <div>
            <Button onClick={() => (window.location.hash = '#/game')}>Play vs CPU</Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Lobby">
      <div className="col" style={{ gap: 16 }}>
        <div className="row" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="muted">
            {loading ? 'Loading rooms...' : `Rooms: ${lobbyList.length}`} • Socket: {socket?.status || 'idle'}
          </div>
          <div className="row">
            <Button onClick={() => (window.location.hash = '#/')} variant="ghost">Back</Button>
            <Button onClick={refreshList} variant="ghost">Refresh</Button>
          </div>
        </div>

        <RoomCreateJoin onCreate={onCreate} onJoin={onJoin} />

        <div className="row" style={{ gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 320 }}>
            <strong style={{ display: 'block', marginBottom: 8 }}>Available Rooms</strong>
            <RoomList rooms={lobbyList} selectedId={activeLobbyId} onSelect={setActiveLobby} onJoin={onJoin} />
          </div>

          <div style={{ flex: 1, minWidth: 320 }} className="col" >
            <div className="surface" style={{ padding: 12, borderRadius: 12 }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <strong>Selected Room</strong>
                <div className="muted" style={{ fontSize: 12 }}>{activeLobbyId ? activeLobbyId : 'None selected'}</div>
              </div>
              <div className="row" style={{ marginTop: 8, gap: 8 }}>
                <Button onClick={() => activeLobbyId && onJoin(activeLobbyId)} disabled={!activeLobbyId}>Join Selected</Button>
                <Button variant="ghost" onClick={() => setActiveLobby(null)} disabled={!activeLobbyId}>Clear</Button>
              </div>
            </div>

            <PlayerList
              players={lobbyPlayers}
              meId={myPlayer.id}
              onToggleReady={onToggleReady}
              onStartGame={onStartGame}
              canStart={canStart}
            />

            <ChatPanel messages={lobbyChat} onSend={onSendChat} />
          </div>
        </div>
      </div>
    </Card>
  );
}

export default Lobby;
