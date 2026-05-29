/**
 * useAutosave — debounced server-side autosave for forms.
 *
 * Fires `saveFn(values)` on every change after `delay` ms of idle. Tracks
 * status so the parent can render a "Saving…" / "Saved" / "Save failed"
 * indicator. Returns the latest status + a manual `flush()` for explicit
 * saves (e.g., before navigation).
 *
 * Why server-side and not just localStorage:
 *   sessionStorage is per-tab and clears on tab close. Users on slow networks
 *   or who log out before clicking Save lose everything. Persisting partials
 *   to the BE survives refresh, logout, device change.
 *
 * Why debounced:
 *   Without debounce every keystroke fires a request. ~800ms idle is long
 *   enough to batch typing but short enough that walking away doesn't lose work.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

const STATUS = {
  IDLE: 'idle',
  SAVING: 'saving',
  SAVED: 'saved',
  ERROR: 'error',
};

/**
 * @param {object} values    Latest form values (typically `watch()` from RHF).
 * @param {function} saveFn  Async function called with the values. Returns a promise.
 * @param {object} options
 *   - delay        Debounce idle window in ms. Default 800.
 *   - enabled      Pause autosaving when false (e.g. while loading). Default true.
 *   - isEqual      Optional equality check between two values snapshots.
 */
export default function useAutosave(values, saveFn, options = {}) {
  const {
    delay = 800,
    enabled = true,
    isEqual = shallowJsonEqual,
  } = options;

  const [status, setStatus] = useState(STATUS.IDLE);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const lastSavedRef = useRef(undefined);
  const timerRef = useRef(null);
  const inflightRef = useRef(false);
  const pendingRef = useRef(null); // queue: latest values that came in while a save was inflight
  const saveFnRef = useRef(saveFn);
  saveFnRef.current = saveFn;

  const performSave = useCallback(async (snapshot) => {
    inflightRef.current = true;
    setStatus(STATUS.SAVING);
    setErrorMessage(null);
    try {
      await saveFnRef.current(snapshot);
      lastSavedRef.current = snapshot;
      setLastSavedAt(Date.now());
      setStatus(STATUS.SAVED);
    } catch (err) {
      setStatus(STATUS.ERROR);
      setErrorMessage(err?.message || 'Could not save your changes.');
    } finally {
      inflightRef.current = false;
      // If new values arrived while saving, persist them next.
      if (pendingRef.current !== null) {
        const next = pendingRef.current;
        pendingRef.current = null;
        performSave(next);
      }
    }
  }, []);

  // Schedule a debounced save on every value change.
  useEffect(() => {
    if (!enabled) return;
    if (lastSavedRef.current === undefined) {
      // First render — treat the initial value as the baseline, don't save it.
      lastSavedRef.current = values;
      return;
    }
    if (isEqual(values, lastSavedRef.current)) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (inflightRef.current) {
        // Save already running — queue the latest values for after it finishes.
        pendingRef.current = values;
      } else {
        performSave(values);
      }
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [values, enabled, delay, isEqual, performSave]);

  /** Force-save immediately. Useful before navigation. */
  const flush = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (isEqual(values, lastSavedRef.current)) return;
    await performSave(values);
  }, [values, isEqual, performSave]);

  /** Treat the current values as the new baseline (use after server-driven reset). */
  const markSaved = useCallback((snapshot) => {
    lastSavedRef.current = snapshot ?? values;
    setLastSavedAt(Date.now());
    setStatus(STATUS.SAVED);
  }, [values]);

  return {
    status,
    lastSavedAt,
    errorMessage,
    flush,
    markSaved,
    isSaving: status === STATUS.SAVING,
    isSaved: status === STATUS.SAVED,
    hasError: status === STATUS.ERROR,
  };
}

function shallowJsonEqual(a, b) {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return a === b;
  }
}

useAutosave.STATUS = STATUS;
