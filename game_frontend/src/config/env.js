//
// Environment and configuration reader for the frontend.
// Reads REACT_APP_* variables safely with defaults.
// PUBLIC INTERFACE functions are documented and exported at the bottom.
//

/**
 * Parse a boolean-like environment string.
 * Accepts: "true","1","yes","on" as true; "false","0","no","off" as false.
 */
function parseBool(value, defaultVal = false) {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return defaultVal;
  const v = value.trim().toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(v)) return true;
  if (['false', '0', 'no', 'off'].includes(v)) return false;
  return defaultVal;
}

/**
 * Parse a comma-separated list into an array of trimmed strings.
 */
function parseCSV(value) {
  if (!value || typeof value !== 'string') return [];
  return value
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

// PUBLIC_INTERFACE
export function getEnv() {
  /**
   * Returns the environment configuration derived from process.env.
   * This function never throws; it always returns safe defaults if variables are missing.
   */
  const {
    REACT_APP_API_BASE,
    REACT_APP_BACKEND_URL,
    REACT_APP_FRONTEND_URL,
    REACT_APP_WS_URL,
    REACT_APP_NODE_ENV,
    REACT_APP_NEXT_TELEMETRY_DISABLED,
    REACT_APP_ENABLE_SOURCE_MAPS,
    REACT_APP_PORT,
    REACT_APP_TRUST_PROXY,
    REACT_APP_LOG_LEVEL,
    REACT_APP_HEALTHCHECK_PATH,
    REACT_APP_FEATURE_FLAGS,
    REACT_APP_EXPERIMENTS_ENABLED,
  } = process.env || {};

  const nodeEnv = REACT_APP_NODE_ENV || process.env.NODE_ENV || 'development';
  const isProd = nodeEnv === 'production';

  return {
    apiBase: REACT_APP_API_BASE || REACT_APP_BACKEND_URL || '',
    backendUrl: REACT_APP_BACKEND_URL || '',
    frontendUrl: REACT_APP_FRONTEND_URL || '',
    wsUrl: REACT_APP_WS_URL || '',
    nodeEnv,
    telemetryDisabled: parseBool(REACT_APP_NEXT_TELEMETRY_DISABLED, true),
    enableSourceMaps: parseBool(REACT_APP_ENABLE_SOURCE_MAPS, !isProd ? true : false),
    port: Number(REACT_APP_PORT || 3000),
    trustProxy: parseBool(REACT_APP_TRUST_PROXY, false),
    logLevel: (REACT_APP_LOG_LEVEL || (isProd ? 'warn' : 'debug')).toLowerCase(),
    healthcheckPath: REACT_APP_HEALTHCHECK_PATH || '/healthz',
    featureFlags: parseCSV(REACT_APP_FEATURE_FLAGS),
    experimentsEnabled: parseBool(REACT_APP_EXPERIMENTS_ENABLED, false),
  };
}

// PUBLIC_INTERFACE
export function getClientConfig() {
  /** Convenience accessor that returns a narrowed config shape for client usage. */
  const env = getEnv();
  return {
    apiBase: env.apiBase,
    wsUrl: env.wsUrl,
    logLevel: env.logLevel,
    featureFlags: env.featureFlags,
    experimentsEnabled: env.experimentsEnabled,
  };
}
