//
// React Context + useReducer store for Jump Squad
//
import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { rootReducer, initialState } from './reducers';
import { actions as actionCreators, ActionTypes } from './actions';
import { selectors as baseSelectors } from './selectors';
import { logger } from '../utils/logger';

// Create contexts
const StateContext = createContext(initialState);
const DispatchContext = createContext(() => {});

// PUBLIC_INTERFACE
export function AppProvider({ children, initial = initialState, reducer = rootReducer, enableLogger = true }) {
  /**
   * Provides state and dispatch via context.
   * Includes optional action logging (disabled automatically in production if log level is higher than debug).
   */
  const [state, dispatchBase] = useReducer(reducer, initial);
  const lastActionRef = useRef(null);

  // optional middleware-like logger
  const dispatch = useMemo(() => {
    if (!enableLogger) return dispatchBase;
    return (action) => {
      try {
        lastActionRef.current = action;
        logger.debug('[store] dispatch', action?.type, action);
      } catch {}
      return dispatchBase(action);
    };
  }, [dispatchBase, enableLogger]);

  useEffect(() => {
    // Post-dispatch effect
    if (!lastActionRef.current) return;
    const a = lastActionRef.current;
    lastActionRef.current = null;

    // Auto-schedule toast dismissals
    if (a?.type === ActionTypes.TOAST_ADD) {
      const id = a.payload?.id;
      const timeoutMs = a.payload?.timeoutMs ?? 3000;
      if (id && timeoutMs > 0) {
        const t = setTimeout(() => {
          dispatchBase({ type: ActionTypes.TOAST_DISMISS, payload: { id } });
        }, timeoutMs);
        return () => clearTimeout(t);
      }
    }
    return undefined;
  }, [state]);

  // Stable memoized values
  const stateValue = useMemo(() => state, [state]);
  const dispatchValue = useMemo(() => dispatch, [dispatch]);

  return (
    <StateContext.Provider value={stateValue}>
      <DispatchContext.Provider value={dispatchValue}>{children}</DispatchContext.Provider>
    </StateContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useAppState() {
  /** Access full app state object. */
  return useContext(StateContext);
}

// PUBLIC_INTERFACE
export function useAppDispatch() {
  /** Access dispatch function for sending actions. */
  return useContext(DispatchContext);
}

// PUBLIC_INTERFACE
export function useActions() {
  /** Returns bound action creators that auto-dispatch. */
  const dispatch = useAppDispatch();
  const bound = useMemo(() => {
    const entries = Object.entries(actionCreators);
    const out = {};
    entries.forEach(([k, creator]) => {
      out[k] = (...args) => dispatch(creator(...args));
    });
    return out;
  }, [dispatch]);
  return bound;
}

// PUBLIC_INTERFACE
export function useSelector(selector) {
  /**
   * Select a piece of state using a selector function.
   * To encourage memo-friendly usage, pass stable inline selectors or use pre-defined selectors.
   */
  const state = useAppState();
  return selector(state);
}

// PUBLIC_INTERFACE
export const selectors = baseSelectors;

// PUBLIC_INTERFACE
export const actions = actionCreators;
