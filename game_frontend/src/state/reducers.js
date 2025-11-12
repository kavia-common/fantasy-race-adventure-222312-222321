//
// Reducers for Jump Squad state domains
//
import { ActionTypes } from './actions';
import { logger } from '../utils/logger';

// Initial states
export const initialUser = {
  id: null,
  name: 'Guest',
  coins: 0,
  avatar: 'basic',
  authenticated: false,
};

export const initialLobby = {
  list: [],
  activeLobbyId: null,
  players: [],           // [{id,name,ready}]
  chat: [],              // [{id,user,text,ts}]
  socketStatus: 'idle',  // idle|connecting|open|closed
};

export const initialGame = {
  matchId: null,
  players: [],
  status: 'idle', // idle | waiting | running | ended
  time: 0,
  data: null, // any additional payload
};

export const initialCosmetics = {
  outfits: [],
  accessories: [],
  equipped: {
    outfit: 'outfit-basic',
    accessory: 'acc-band',
  },
  owned: new Set(['outfit-basic', 'acc-band']),
};

export const initialToasts = {
  items: [],
};

export const initialLeaderboard = {
  items: [],
  status: 'idle', // idle|loading|loaded|error
};

// Domain reducers
function userReducer(state = initialUser, action) {
  switch (action.type) {
    case ActionTypes.USER_SET:
      return { ...state, ...(action.payload || {}), authenticated: !!(action.payload && action.payload.id) };
    case ActionTypes.USER_CLEAR:
      return { ...initialUser };
    case ActionTypes.USER_UPDATE:
      return { ...state, ...(action.payload || {}) };
    case ActionTypes.WALLET_EARN: {
      const add = Math.max(0, Number(action.payload?.amount) || 0);
      return { ...state, coins: (Number(state.coins) || 0) + add };
    }
    case ActionTypes.WALLET_SPEND: {
      const sub = Math.max(0, Number(action.payload?.amount) || 0);
      const next = Math.max(0, (Number(state.coins) || 0) - sub);
      return { ...state, coins: next };
    }
    default:
      return state;
  }
}

function leaderboardReducer(state = initialLeaderboard, action) {
  switch (action.type) {
    case ActionTypes.LEADERBOARD_SET:
      return { ...state, items: action.payload || [], status: 'loaded' };
    case ActionTypes.LEADERBOARD_STATUS:
      return { ...state, status: action.payload?.status || 'idle' };
    default:
      return state;
  }
}

function lobbyReducer(state = initialLobby, action) {
  switch (action.type) {
    case ActionTypes.LOBBY_SET_LIST:
      return { ...state, list: action.payload || [] };
    case ActionTypes.LOBBY_ADD:
      return { ...state, list: [...state.list.filter(l => l.id !== action.payload?.id), action.payload] };
    case ActionTypes.LOBBY_UPDATE:
      return {
        ...state,
        list: state.list.map(l => (l.id === action.payload?.id ? { ...l, ...action.payload } : l)),
      };
    case ActionTypes.LOBBY_REMOVE:
      return { ...state, list: state.list.filter(l => l.id !== action.payload?.id) };
    case ActionTypes.LOBBY_SET_ACTIVE:
      return { ...state, activeLobbyId: action.payload?.id ?? null };
    case ActionTypes.LOBBY_CLEAR_ACTIVE:
      return { ...state, activeLobbyId: null, players: [], chat: [] };
    case ActionTypes.LOBBY_SET_PLAYERS:
      return { ...state, players: action.payload || [] };
    case ActionTypes.LOBBY_UPDATE_PLAYER: {
      const p = action.payload;
      if (!p || !p.id) return state;
      const idx = state.players.findIndex(x => x.id === p.id);
      const players = [...state.players];
      if (idx >= 0) players[idx] = { ...players[idx], ...p };
      else players.push(p);
      return { ...state, players };
    }
    case ActionTypes.LOBBY_SET_READY: {
      const { playerId, ready } = action.payload || {};
      if (!playerId) return state;
      const players = state.players.map(pl => (pl.id === playerId ? { ...pl, ready: !!ready } : pl));
      return { ...state, players };
    }
    case ActionTypes.LOBBY_SET_CHAT:
      return { ...state, chat: action.payload || [] };
    case ActionTypes.LOBBY_ADD_CHAT: {
      const item = action.payload;
      if (!item) return state;
      return { ...state, chat: [...state.chat, item] };
    }
    case ActionTypes.LOBBY_CLEAR_CHAT:
      return { ...state, chat: [] };
    case ActionTypes.LOBBY_SET_SOCKET:
      return { ...state, socketStatus: action.payload?.status || 'idle' };
    default:
      return state;
  }
}

function gameReducer(state = initialGame, action) {
  switch (action.type) {
    case ActionTypes.GAME_SET_STATE:
      return { ...initialGame, ...(action.payload || {}) };
    case ActionTypes.GAME_UPDATE_STATE:
      return { ...state, ...(action.payload || {}) };
    case ActionTypes.GAME_CLEAR_STATE:
      return { ...initialGame };
    default:
      return state;
  }
}

function cosmeticsReducer(state = initialCosmetics, action) {
  switch (action.type) {
    case ActionTypes.COSMETICS_SET: {
      const ownedIds = new Set(state.owned);
      (action.payload?.outfits || []).forEach((o) => o.owned && ownedIds.add(o.id));
      (action.payload?.accessories || []).forEach((a) => a.owned && ownedIds.add(a.id));
      return {
        ...state,
        outfits: action.payload?.outfits ?? state.outfits,
        accessories: action.payload?.accessories ?? state.accessories,
        owned: ownedIds,
      };
    }
    case ActionTypes.COSMETICS_PURCHASE: {
      const id = action.payload?.itemId;
      if (!id) return state;
      const owned = new Set(state.owned);
      owned.add(id);
      return { ...state, owned };
    }
    case ActionTypes.COSMETICS_EQUIP: {
      const id = action.payload?.itemId;
      if (!id) return state;
      const isOutfit = id.startsWith('outfit-');
      const isAccessory = id.startsWith('acc-') || id.startsWith('accessory-');
      const owned = state.owned.has(id);
      if (!owned) {
        logger.warn('[cosmetics] cannot equip not-owned item', id);
        return state;
      }
      return {
        ...state,
        equipped: {
          ...state.equipped,
          ...(isOutfit ? { outfit: id } : {}),
          ...(isAccessory ? { accessory: id } : {}),
        },
      };
    }
    default:
      return state;
  }
}

function toastsReducer(state = initialToasts, action) {
  switch (action.type) {
    case ActionTypes.TOAST_ADD: {
      const id = action.payload?.id || Math.random().toString(36).slice(2);
      const item = { id, message: action.payload?.message || '', timeoutMs: action.payload?.timeoutMs ?? 3000 };
      return { ...state, items: [...state.items, item] };
    }
    case ActionTypes.TOAST_DISMISS:
      return { ...state, items: state.items.filter(t => t.id !== action.payload?.id) };
    case ActionTypes.TOAST_CLEAR_ALL:
      return { ...state, items: [] };
    default:
      return state;
  }
}

// PUBLIC_INTERFACE
export const initialState = {
  user: initialUser,
  lobby: initialLobby,
  game: initialGame,
  cosmetics: initialCosmetics,
  toasts: initialToasts,
  leaderboard: initialLeaderboard,
};

// PUBLIC_INTERFACE
export function rootReducer(state, action) {
  /** Root reducer composing domain reducers. */
  if (!state) state = initialState;
  return {
    user: userReducer(state.user, action),
    lobby: lobbyReducer(state.lobby, action),
    game: gameReducer(state.game, action),
    cosmetics: cosmeticsReducer(state.cosmetics, action),
    toasts: toastsReducer(state.toasts, action),
    leaderboard: leaderboardReducer(state.leaderboard, action),
  };
}
