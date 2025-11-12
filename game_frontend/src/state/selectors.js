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
};
