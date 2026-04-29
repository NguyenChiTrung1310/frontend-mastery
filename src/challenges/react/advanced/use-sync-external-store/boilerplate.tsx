'use client';

/**
 * 🚧 BOILERPLATE
 *
 * Three hooks subscribe to browser APIs using the naive useState+useEffect pattern.
 * Problems in concurrent React:
 *  - Tearing: two components can read different snapshots of the same event within one render.
 *  - Missing SSR initial value: useEffect never runs on the server, so SSR sees undefined.
 *
 * Your goal: rewrite each hook using `useSyncExternalStore` from 'react'.
 *
 * Hints:
 *  - useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)
 *  - subscribe must RETURN the unsubscribe function — don't forget!
 *  - getSnapshot must be pure and return a primitive (or stable reference).
 *  - Guard matchMedia with `typeof window !== 'undefined'` for SSR safety.
 */

import { useEffect, useState } from 'react';

// ❌ TODO: replace with useSyncExternalStore
function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const handleOnline = (): void => setOnline(true);
    const handleOffline = (): void => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return online;
}

// ❌ TODO: replace with useSyncExternalStore
function useWindowWidth(): number {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

  useEffect(() => {
    const handleResize = (): void => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
}

// ❌ TODO: replace with useSyncExternalStore
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e: MediaQueryListEvent): void => setMatches(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

export default function UseSyncExternalStoreBoilerplate(): React.JSX.Element {
  const isOnline = useOnlineStatus();
  const width = useWindowWidth();
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div className="space-y-4">
      <div>
        <h2 className="mb-1 text-base font-semibold">Browser API Subscriptions</h2>
        <p className="text-xs text-muted-foreground">
          Toggle your network in DevTools, resize the window, or open split-view to test.
        </p>
      </div>
      <div className="grid gap-3">
        <StatusCard label="Network status" value={isOnline ? '🟢 Online' : '🔴 Offline'} />
        <StatusCard label="Window width" value={`${width}px`} />
        <StatusCard label="Is mobile (≤768px)" value={isMobile ? 'Yes' : 'No'} />
      </div>
      <p className="text-xs text-muted-foreground">
        Refactor each hook to use <code className="rounded bg-muted px-1">useSyncExternalStore</code>.
      </p>
    </div>
  );
}

function StatusCard({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="flex items-center justify-between rounded-md border px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-mono text-sm font-medium">{value}</span>
    </div>
  );
}
