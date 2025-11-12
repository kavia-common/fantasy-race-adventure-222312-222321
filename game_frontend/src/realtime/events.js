//
// Event name registry for realtime interactions across lobby and game
//

// PUBLIC_INTERFACE
export const RealtimeEvents = {
  // System/internal
  SOCKET_OPEN: '__socket.open',
  SOCKET_CLOSE: '__socket.close',

  // Lobby domain
  LOBBY_LIST: 'lobby.list',
  LOBBY_CREATED: 'lobby.created',
  LOBBY_UPDATED: 'lobby.updated',
  LOBBY_REMOVED: 'lobby.removed',
  LOBBY_CHAT: 'lobby.chat',
  LOBBY_JOINED: 'lobby.joined',
  LOBBY_LEFT: 'lobby.left',

  // Match/Game domain
  MATCH_CREATED: 'match.created',
  MATCH_STARTED: 'match.started',
  MATCH_TICK: 'match.tick', // e.g., frame or state updates
  MATCH_EVENT: 'match.event', // domain-specific events (powerups, coins, etc.)
  MATCH_ENDED: 'match.ended',
  PLAYER_JOINED: 'player.joined',
  PLAYER_LEFT: 'player.left',
  PLAYER_STATE: 'player.state',
};

// PUBLIC_INTERFACE
export const ALL_EVENTS = '*';
