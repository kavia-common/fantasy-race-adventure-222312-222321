/**
 * API Endpoints for Jump Squad
 * Provides thin wrappers around http.js with graceful fallbacks to mock data when backend is unreachable.
 */
import { httpGet, httpPost, httpPatch, httpDelete } from './http';
import { logger } from '../utils/logger';

/**
 * Internal helper: if a response is not ok, return mock fallback.
 */
async function withFallback(promise, mockValue, ctxLabel = 'api') {
  try {
    const res = await promise;
    if (res.ok) return res.data;
    logger.warn(`[${ctxLabel}] backend not ok, using fallback`);
    return mockValue;
  } catch (err) {
    logger.error(`[${ctxLabel}] request failed, using fallback`, err);
    return mockValue;
  }
}

/**
 * Mock data providers
 */
const mockUser = { id: 'guest', name: 'Guest', coins: 0, avatar: 'basic' };

/**
 * PUBLIC_INTERFACE
 * Leaderboard API
 */
const mockTopScores = [
  { id: 'u1', name: 'Nova', score: 12450 },
  { id: 'u2', name: 'Kai', score: 11210 },
  { id: 'u3', name: 'Mika', score: 9750 },
  { id: 'u4', name: 'Aria', score: 8960 },
  { id: 'u5', name: 'Zed', score: 8450 },
];

/**
 * Fetch top scores. Returns array of {id,name,score}.
 * Accepts optional { limit } query param.
 */
export const leaderboardApi = {
  // PUBLIC_INTERFACE
  async getTopScores({ limit = 10 } = {}) {
    return withFallback(
      httpGet('leaderboard/top', { limit }),
      mockTopScores.slice(0, limit),
      'leaderboard.getTopScores'
    );
  },
};
const mockLobbyList = [
  { id: 'lobby-1', name: 'Casual Run', players: 2, maxPlayers: 8, status: 'open' },
  { id: 'lobby-2', name: 'Pro League', players: 5, maxPlayers: 8, status: 'open' },
];
const mockGameState = {
  matchId: 'local-1',
  players: [{ id: 'guest', name: 'Guest', x: 0, y: 0 }],
  status: 'waiting',
  time: 0,
};
const mockCosmetics = {
  outfits: [
    { id: 'outfit-basic', name: 'Basic', owned: true, price: 0 },
    { id: 'outfit-spark', name: 'Spark Runner', owned: false, price: 100 },
  ],
  accessories: [
    { id: 'acc-band', name: 'Headband', owned: true, price: 0 },
    { id: 'acc-shades', name: 'Shades', owned: false, price: 60 },
  ],
};

/**
 * PUBLIC_INTERFACE
 * Auth API
 */
export const authApi = {
  /**
   * Login or guest session creation.
   * @param {{username?:string,password?:string}} payload
   * @returns {Promise<{id:string,name:string,coins:number,avatar:string}>}
   */
  async login(payload) {
    return withFallback(
      httpPost('auth/login', payload, { credentials: true }),
      mockUser,
      'auth.login'
    );
  },

  /**
   * Fetch current session user.
   * @returns {Promise<{id:string,name:string,coins:number,avatar:string}>}
   */
  async me() {
    return withFallback(
      httpGet('auth/me', undefined, { credentials: true }),
      mockUser,
      'auth.me'
    );
  },

  /**
   * Logout current user.
   * @returns {Promise<{success:boolean}>}
   */
  async logout() {
    const res = await httpPost('auth/logout', {}, { credentials: true });
    if (!res.ok) {
      logger.warn('[auth.logout] backend not reachable, treating as success');
      return { success: true };
    }
    return { success: true };
  },
};

/**
 * PUBLIC_INTERFACE
 * Lobby API
 */
export const lobbyApi = {
  /**
   * List available lobbies.
   * @returns {Promise<Array<{id:string,name:string,players:number,maxPlayers:number,status:string}>>}
   */
  async list() {
    return withFallback(httpGet('lobbies'), mockLobbyList, 'lobby.list');
  },

  /**
   * Create a new lobby.
   * @param {{name:string,maxPlayers?:number,private?:boolean}} payload
   * @returns {Promise<{id:string,name:string,players:number,maxPlayers:number,status:string}>}
   */
  async create(payload) {
    return withFallback(
      httpPost('lobbies', payload, { credentials: true }),
      { ...mockLobbyList[0], id: `mock-${Date.now()}`, name: payload?.name || 'New Lobby' },
      'lobby.create'
    );
  },

  /**
   * Join a lobby by ID.
   * @param {string} lobbyId
   * @returns {Promise<{success:boolean,lobbyId:string}>}
   */
  async join(lobbyId) {
    const res = await httpPost(`lobbies/${encodeURIComponent(lobbyId)}/join`, {}, { credentials: true });
    if (!res.ok) {
      logger.warn('[lobby.join] backend unreachable, returning mock success');
      return { success: true, lobbyId };
    }
    return { success: true, lobbyId };
  },

  /**
   * Leave a lobby by ID.
   * @param {string} lobbyId
   * @returns {Promise<{success:boolean}>}
   */
  async leave(lobbyId) {
    const res = await httpPost(`lobbies/${encodeURIComponent(lobbyId)}/leave`, {}, { credentials: true });
    if (!res.ok) {
      logger.warn('[lobby.leave] backend unreachable, returning mock success');
      return { success: true };
    }
    return { success: true };
  },
};

/**
 * PUBLIC_INTERFACE
 * Game API
 */
export const gameApi = {
  /**
   * Fetch current game/match state.
   * @param {string} matchId
   * @returns {Promise<any>}
   */
  async getState(matchId) {
    return withFallback(
      httpGet(`games/${encodeURIComponent(matchId)}`),
      { ...mockGameState, matchId },
      'game.getState'
    );
  },

  /**
   * Submit an action/update for the current match.
   * @param {string} matchId
   * @param {Object} action
   * @returns {Promise<{ok:boolean}>}
   */
  async sendAction(matchId, action) {
    const res = await httpPost(`games/${encodeURIComponent(matchId)}/actions`, action, { timeoutMs: 5000 });
    if (!res.ok) {
      logger.warn('[game.sendAction] backend unreachable, treating as success');
      return { ok: true };
    }
    return { ok: true };
  },

  /**
   * Exit or end the current match.
   * @param {string} matchId
   * @returns {Promise<{success:boolean}>}
   */
  async end(matchId) {
    const res = await httpDelete(`games/${encodeURIComponent(matchId)}`);
    if (!res.ok) {
      logger.warn('[game.end] backend unreachable, returning mock success');
      return { success: true };
    }
    return { success: true };
  },
};

/**
 * PUBLIC_INTERFACE
 * Cosmetics API
 */
export const cosmeticsApi = {
  /**
   * List available cosmetics for the user.
   * @returns {Promise<{outfits:Array, accessories:Array}>}
   */
  async list() {
    return withFallback(httpGet('cosmetics'), mockCosmetics, 'cosmetics.list');
  },

  /**
   * Purchase a cosmetic by id.
   * @param {{itemId:string}} payload
   * @returns {Promise<{success:boolean, itemId:string}>}
   */
  async purchase(payload) {
    const res = await httpPost('cosmetics/purchase', payload, { credentials: true });
    if (!res.ok) {
      logger.warn('[cosmetics.purchase] backend unreachable, returning mock success');
      return { success: true, itemId: payload?.itemId };
    }
    return { success: true, itemId: payload?.itemId };
  },

  /**
   * Equip a cosmetic by id.
   * @param {{itemId:string}} payload
   * @returns {Promise<{success:boolean, itemId:string}>}
   */
  async equip(payload) {
    const res = await httpPatch('cosmetics/equip', payload, { credentials: true });
    if (!res.ok) {
      logger.warn('[cosmetics.equip] backend unreachable, returning mock success');
      return { success: true, itemId: payload?.itemId };
    }
    return { success: true, itemId: payload?.itemId };
  },
};
