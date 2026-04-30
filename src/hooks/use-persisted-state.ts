'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface PersistedEnvelope<T> {
  version: number;
  value: T;
}

interface Options<T> {
  version?: number;
  validate?: (raw: unknown) => raw is T;
}

/**
 * SSR-safe localStorage hook with cross-tab sync via the `storage` event.
 * Initial render returns `initial` to keep server and first-client paint in lockstep;
 * the persisted value hydrates inside `useEffect`. Versioned: when the stored envelope
 * doesn't match the current version (or fails validation), it falls back to `initial`.
 */
export function usePersistedState<T>(
  key: string,
  initial: T,
  options: Options<T> = {},
): [T, (next: T | ((prev: T) => T)) => void] {
  const { version = 1, validate } = options;
  const [state, setState] = useState<T>(initial);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return;
      const parsed = JSON.parse(raw) as unknown;
      if (
        typeof parsed !== 'object' ||
        parsed === null ||
        !('version' in parsed) ||
        (parsed as PersistedEnvelope<unknown>).version !== version
      ) {
        return;
      }
      const value = (parsed as PersistedEnvelope<unknown>).value;
      if (validate && !validate(value)) return;
      setState(value as T);
    } catch {
      // Ignore — corrupted entry, fall back to `initial`.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, version]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: StorageEvent): void => {
      if (e.key !== key || e.newValue === null) return;
      try {
        const parsed = JSON.parse(e.newValue) as unknown;
        if (
          typeof parsed !== 'object' ||
          parsed === null ||
          !('version' in parsed) ||
          (parsed as PersistedEnvelope<unknown>).version !== version
        ) {
          return;
        }
        const value = (parsed as PersistedEnvelope<unknown>).value;
        if (validate && !validate(value)) return;
        setState(value as T);
      } catch {
        // Ignore.
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, version]);

  const setPersisted = useCallback(
    (next: T | ((prev: T) => T)): void => {
      setState((prev) => {
        const resolved =
          typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
        try {
          const envelope: PersistedEnvelope<T> = { version, value: resolved };
          window.localStorage.setItem(key, JSON.stringify(envelope));
        } catch {
          // Quota or private mode — drop the write silently.
        }
        return resolved;
      });
    },
    [key, version],
  );

  return [state, setPersisted];
}
