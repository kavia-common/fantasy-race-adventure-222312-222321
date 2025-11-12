//
// Centralized action types and creators for Jump Squad state
//

// Namespaced action types by domain
export const ActionTypes = {
  // User/auth
  USER_SET: 'user/set',
  USER_CLEAR: 'user/clear',
  USER_UPDATE: 'user/update',

  // Lobby
  LOBBY_SET_LIST: 'lobby/setList',
  LOBBY_ADD: 'lobby/add',
  LOBBY_UPDATE: 'lobby/update',
  LOBBY_REMOVE: 'lobby/remove',
  LOBBY_SET_ACTIVE: 'lobby/setActive',
  LOBBY_CLEAR_ACTIVE: 'lobby/clearActive',
  LOBBY_SET_PLAYERS: 'lobby/setPlayers',
  LOBBY_UPDATE_PLAYER: 'lobby/updatePlayer',
  LOBBY_SET_READY: 'lobby/setReady',
  LOBBY_SET_CHAT: 'lobby/setChat',
  LOBBY_ADD_CHAT: 'lobby/addChat',
  LOBBY_CLEAR_CHAT: 'lobby/clearChat',
  LOBBY_SET_SOCKET: 'lobby/setSocketStatus',

  // Game
  GAME_SET_STATE: 'game/setState',
  GAME_UPDATE_STATE: 'game/updateState',
  GAME_CLEAR_STATE: 'game/clearState',

  // Cosmetics
  COSMETICS_SET: 'cosmetics/set',
  COSMETICS_EQUIP: 'cosmetics/equip',
  COSMETICS_PURCHASE: 'cosmetics/purchase',

  // Toasts
  TOAST_ADD: 'toast/add',
  TOAST_DISMISS: 'toast/dismiss',
  TOAST_CLEAR_ALL: 'toast/clearAll',
};

// PUBLIC_INTERFACE
export const actions = {
  /** Create set user action. */
  setUser: (user) => ({ type: ActionTypes.USER_SET, payload: user }),
  /** Create clear user action. */
  clearUser: () => ({ type: ActionTypes.USER_CLEAR }),
  /** Create partial user update action. */
  updateUser: (patch) => ({ type: ActionTypes.USER_UPDATE, payload: patch }),

  /** Set lobby list. */
  setLobbyList: (list) => ({ type: ActionTypes.LOBBY_SET_LIST, payload: Array.isArray(list) ? list : [] }),
  /** Add a lobby. */
  addLobby: (lobby) => ({ type: ActionTypes.LOBBY_ADD, payload: lobby }),
  /** Update a lobby by id. */
  updateLobby: (lobby) => ({ type: ActionTypes.LOBBY_UPDATE, payload: lobby }),
  /** Remove a lobby by id. */
  removeLobby: (id) => ({ type: ActionTypes.LOBBY_REMOVE, payload: { id } }),
  /** Set active lobby id. */
  setActiveLobby: (id) => ({ type: ActionTypes.LOBBY_SET_ACTIVE, payload: { id } }),
  /** Clear active lobby. */
  clearActiveLobby: () => ({ type: ActionTypes.LOBBY_CLEAR_ACTIVE }),
  /** Replace players list for current lobby. */
  setLobbyPlayers: (players) => ({ type: ActionTypes.LOBBY_SET_PLAYERS, payload: Array.isArray(players) ? players : [] }),
  /** Update one player in current lobby by id. */
  updateLobbyPlayer: (player) => ({ type: ActionTypes.LOBBY_UPDATE_PLAYER, payload: player }),
  /** Set my ready status (or a player). */
  setReadyStatus: (playerId, ready) => ({ type: ActionTypes.LOBBY_SET_READY, payload: { playerId, ready } }),
  /** Replace chat messages. */
  setLobbyChat: (messages) => ({ type: ActionTypes.LOBBY_SET_CHAT, payload: Array.isArray(messages) ? messages : [] }),
  /** Push a chat message. */
  addLobbyChat: (message) => ({ type: ActionTypes.LOBBY_ADD_CHAT, payload: message }),
  /** Clear chat history. */
  clearLobbyChat: () => ({ type: ActionTypes.LOBBY_CLEAR_CHAT }),
  /** Track socket connectivity for lobby. */
  setLobbySocketStatus: (status) => ({ type: ActionTypes.LOBBY_SET_SOCKET, payload: { status } }),

  /** Set full game state. */
  setGameState: (state) => ({ type: ActionTypes.GAME_SET_STATE, payload: state }),
  /** Merge/patch game state. */
  updateGameState: (patch) => ({ type: ActionTypes.GAME_UPDATE_STATE, payload: patch }),
  /** Clear game state. */
  clearGameState: () => ({ type: ActionTypes.GAME_CLEAR_STATE }),

  /** Set cosmetics inventory and metadata. */
  setCosmetics: (data) => ({ type: ActionTypes.COSMETICS_SET, payload: data }),
  /** Equip an item id on the user/avatar. */
  equipCosmetic: (itemId) => ({ type: ActionTypes.COSMETICS_EQUIP, payload: { itemId } }),
  /** Mark cosmetic purchased. */
  purchaseCosmetic: (itemId) => ({ type: ActionTypes.COSMETICS_PURCHASE, payload: { itemId } }),

  /** Add a toast with optional timeoutMs (0 to persist). */
  addToast: (message, timeoutMs = 3000, id) => ({ type: ActionTypes.TOAST_ADD, payload: { id, message, timeoutMs } }),
  /** Dismiss a toast by id. */
  dismissToast: (id) => ({ type: ActionTypes.TOAST_DISMISS, payload: { id } }),
  /** Clear all toasts. */
  clearToasts: () => ({ type: ActionTypes.TOAST_CLEAR_ALL }),
};
