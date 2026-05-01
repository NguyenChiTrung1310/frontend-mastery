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

import { useEffect, useRef, useState } from 'react';

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

  const [logs, setLogs] = useState<string[]>([]);
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;
  const renderCount = renderCountRef.current;

  // Track the last-seen values to detect tearing: if two hooks read
  // different values for the same browser event within one render, that's a tear.
  const prevOnlineRef = useRef<boolean | null>(null);
  const prevWidthRef = useRef<number | null>(null);

  useEffect(() => {
    const addLog = (msg: string): void =>
      setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));

    // Detect tearing: with useState+useEffect the initial render sees stale
    // values (useState defaults), then a second render fires after effects run.
    if (prevOnlineRef.current !== null && prevOnlineRef.current !== isOnline) {
      addLog(`🔴 Tearing detected — online changed from ${String(prevOnlineRef.current)} to ${String(isOnline)} mid-render #${renderCount}`);
    }
    if (prevWidthRef.current !== null && prevWidthRef.current !== width) {
      addLog(`⚠️ Width changed ${prevWidthRef.current}px → ${width}px (render #${renderCount})`);
    }

    const logEvent = (name: string, value: string): void =>
      addLog(`📡 ${name}: ${value} (render #${renderCount})`);

    logEvent('online', String(isOnline));
    logEvent('width', `${width}px`);
    logEvent('isMobile', String(isMobile));

    prevOnlineRef.current = isOnline;
    prevWidthRef.current = width;
  });

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

      {/* Event log — shows each browser event + render cycle. With useState+useEffect,
          watch for the "Tearing detected" entry when values disagree within one render. */}
      <div className="rounded-md border bg-muted/30 p-3 font-mono text-xs max-h-48 overflow-y-auto space-y-1">
        {logs.length === 0
          ? <p className="text-muted-foreground">Interact with the browser to see events… (resize window, toggle network)</p>
          : logs.map((log, i) => (
            <p key={i} className={log.includes('🔴 Tearing') ? 'text-red-500 font-semibold' : ''}>{log}</p>
          ))
        }
      </div>

      <p className="text-xs text-muted-foreground">
        Refactor each hook to use <code className="rounded bg-muted px-1">useSyncExternalStore</code>.
        With the fix, the 🔴 tearing entries and double-render artefacts disappear.
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
