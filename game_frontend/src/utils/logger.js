/**
 * Lightweight logger utility honoring log level from env.
 * Levels: trace < debug < info < warn < error < none
 */
import { getEnv } from '../config/env';

const levelOrder = ['trace', 'debug', 'info', 'warn', 'error', 'none'];

function shouldLog(current, desired) {
  const c = levelOrder.indexOf(current);
  const d = levelOrder.indexOf(desired);
  if (c === -1 || d === -1) return false;
  return c <= d;
}

function base() {
  const { logLevel } = getEnv();
  return (level, args) => {
    if (shouldLog(level, logLevel)) {
      // eslint-disable-next-line no-console
      const fn =
        level === 'error'
          ? console.error
          : level === 'warn'
          ? console.warn
          : level === 'info'
          ? console.info
          : console.log;
      fn(...args);
    }
  };
}

const emit = base();

// PUBLIC_INTERFACE
export const logger = {
  /** Log with trace severity. */
  trace: (...args) => emit('trace', args),
  /** Log with debug severity. */
  debug: (...args) => emit('debug', args),
  /** Log with info severity. */
  info: (...args) => emit('info', args),
  /** Log with warn severity. */
  warn: (...args) => emit('warn', args),
  /** Log with error severity. */
  error: (...args) => emit('error', args),
};
