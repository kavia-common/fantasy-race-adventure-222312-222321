import { getEnv } from './env';

/**
 * Turn a list like ["a", "b=true", "c=false", "k=v"] into an object.
 */
function parseKeyValues(list) {
  const out = {};
  (list || []).forEach((entry) => {
    const [rawK, rawV] = String(entry).split('=');
    const k = (rawK || '').trim();
    if (!k) return;
    if (typeof rawV === 'undefined') {
      out[k] = true;
    } else {
      const v = rawV.trim().toLowerCase();
      if (['true','1','yes','on'].includes(v)) out[k] = true;
      else if (['false','0','no','off'].includes(v)) out[k] = false;
      else out[k] = rawV.trim();
    }
  });
  return out;
}

// PUBLIC_INTERFACE
export function getFeatureFlags() {
  /** Returns a normalized feature flags object from env with defaults. */
  const env = getEnv();
  const defaults = parseKeyValues(env.featureFlagsDefaults || ['multiplayer=false','aiDifficulty=easy']);
  const envFlags = parseKeyValues(env.featureFlags || []);
  const flags = { ...defaults, ...envFlags };

  return {
    ...flags,
    experimentsEnabled: env.experimentsEnabled,
    has(flagName) {
      return !!flags[flagName];
    },
    get(name, fallback) {
      return typeof flags[name] === 'undefined' ? fallback : flags[name];
    },
  };
}

// PUBLIC_INTERFACE
export function isFeatureEnabled(flagName) {
  /** Shorthand boolean check for a named feature flag. */
  const flags = getFeatureFlags();
  return !!flags[flagName];
}
