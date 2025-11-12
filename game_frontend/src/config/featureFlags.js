import { getEnv } from './env';

// PUBLIC_INTERFACE
export function getFeatureFlags() {
  /** Returns a normalized feature flags object from env. */
  const env = getEnv();
  const flags = {};
  env.featureFlags.forEach(flag => {
    flags[flag] = true;
  });
  return {
    ...flags,
    experimentsEnabled: env.experimentsEnabled,
    has(flagName) {
      return !!flags[flagName];
    },
  };
}

// PUBLIC_INTERFACE
export function isFeatureEnabled(flagName) {
  /** Shorthand boolean check for a named feature flag. */
  const flags = getFeatureFlags();
  return !!flags[flagName];
}
