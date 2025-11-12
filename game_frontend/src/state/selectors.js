//
// Memo-friendly selectors for Jump Squad state
//

// PUBLIC_INTERFACE
export const selectors = {
  /** Get current user object. */
  user: (state) => state.user,
  /** Whether user is authenticated. */
  isAuthenticated: (state) => !!state.user?.authenticated,

  /** Lobby list array. */
  lobbyList: (state) => state.lobby.list,
  /** Active lobby id. */
  activeLobbyId: (state) => state.lobby.activeLobbyId,
  /** Active lobby object or null. */
  activeLobby: (state) => state.lobby.list.find((l) => l.id === state.lobby.activeLobbyId) || null,
  /** Players in active lobby. */
  lobbyPlayers: (state) => state.lobby.players,
  /** Chat messages in active lobby. */
  lobbyChat: (state) => state.lobby.chat,
  /** Lobby socket connection status. */
  lobbySocketStatus: (state) => state.lobby.socketStatus,

  /** Game state. */
  game: (state) => state.game,
  /** Is match running. */
  isMatchRunning: (state) => state.game?.status === 'running',

  /** Cosmetics domain. */
  cosmetics: (state) => state.cosmetics,
  /** Equipped cosmetic ids. */
  equipped: (state) => state.cosmetics.equipped,
  /** Owned set for quick checks. */
  owned: (state) => state.cosmetics.owned,

  /** Toasts list. */
  toasts: (state) => state.toasts.items,

  /** Wallet: current coin balance. */
  coins: (state) => Number(state.user?.coins) || 0,
  /** Whether user can afford a price. */
  canAfford: (price) => (state) => (Number(state.user?.coins) || 0) >= (Number(price) || 0),

  /** Leaderboard items cache. */
  leaderboardItems: (state) => state.leaderboard.items,
  /** Leaderboard fetch status. */
  leaderboardStatus: (state) => state.leaderboard.status,
};
