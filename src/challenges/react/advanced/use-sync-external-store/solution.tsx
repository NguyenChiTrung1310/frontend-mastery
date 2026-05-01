'use client';

/**
 * ✅ SOLUTION — useSyncExternalStore for browser APIs
 *
 * Three things make this pattern correct in concurrent React:
 *
 *  1. **No tearing** — `useSyncExternalStore` reads `getSnapshot` synchronously during
 *     the render commit phase. Every component in the same render pass sees the same
 *     snapshot. With `useState`+`useEffect`, the initial render shows the stale
 *     `useState` initial value; a second render is needed to get the live value.
 *
 *  2. **SSR safety** — `getServerSnapshot` returns a sensible server-side default.
 *     Without it, Next.js SSR outputs `undefined` and the client hydrates with a
 *     different value, causing a hydration mismatch warning (and potential UI flash).
 *
 *  3. **Minimal surface area** — the `subscribe` / `getSnapshot` pair is all React
 *     needs. No `useEffect` at all — React manages the subscription lifecycle.
 *
 * Why not `useState`+`useEffect` for everything?
 *   For purely visual, non-critical state (like a window width indicator) the
 *   difference is invisible. But for state that drives layout, routing, or
 *   accessibility decisions, tearing can produce bugs that are impossible to
 *   reproduce reliably. `useSyncExternalStore` is a correctness guarantee, not
 *   just an optimization.
 */

import { useSyncExternalStore } from 'react';

// Subscribe to online/offline events. getServerSnapshot returns true — a server
// has no concept of "offline", so we assume connected during SSR.
function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener('online', cb);
      window.addEventListener('offline', cb);
      return () => {
        window.removeEventListener('online', cb);
        window.removeEventListener('offline', cb);
      };
    },
    () => navigator.onLine,
    () => true,
  );
}

// Subscribe to resize events. We round to 4px to batch micro-resizes and avoid
// excess re-renders during smooth drag operations.
function useWindowWidth(): number {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener('resize', cb);
      return () => window.removeEventListener('resize', cb);
    },
    () => Math.round(window.innerWidth / 4) * 4,
    () => 1024, // safe default for SSR
  );
}

// Subscribe to a MediaQueryList. `matchMedia` is browser-only, so we gate the
// snapshot and fall back for SSR.
function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', cb);
      return () => mql.removeEventListener('change', cb);
    },
    () => window.matchMedia(query).matches,
    () => false, // unknown on server — don't assume mobile
  );
}

export default function UseSyncExternalStoreSolution(): React.JSX.Element {
  const isOnline = useOnlineStatus();
  const width = useWindowWidth();
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div className="space-y-4">
      <div>
        <h2 className="mb-1 text-base font-semibold">Browser API Subscriptions (tear-free)</h2>
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
        All three hooks use <code className="rounded bg-muted px-1">useSyncExternalStore</code> —
        no <code className="rounded bg-muted px-1">useState</code> or{' '}
        <code className="rounded bg-muted px-1">useEffect</code> needed.
      </p>

      <div className="rounded-md border border-border bg-card p-4 space-y-3">
        <p className="text-sm font-semibold">✅ Why This Works</p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li><code className="rounded bg-muted px-1">useSyncExternalStore</code> reads the snapshot synchronously during commit — all components in one render pass see the same value, eliminating tearing.</li>
          <li>The <code className="rounded bg-muted px-1">getServerSnapshot</code> third argument provides a safe SSR default, preventing hydration mismatches that <code className="rounded bg-muted px-1">useState+useEffect</code> causes.</li>
          <li>React manages the subscription lifecycle automatically — no manual cleanup in <code className="rounded bg-muted px-1">useEffect</code> needed, and no missed events during concurrent renders.</li>
        </ul>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-md border border-red-800 bg-red-950/40 p-3">
            <p className="text-xs font-semibold text-red-400 mb-2">❌ Before</p>
            <pre className="text-xs text-red-200 whitespace-pre-wrap">{`const [online, setOnline] = useState(true);
useEffect(() => {
  window.addEventListener('online', ...);
  // initial value wrong on SSR
  // tearing possible in concurrent mode
}, []);`}</pre>
          </div>
          <div className="rounded-md border border-green-800 bg-green-950/40 p-3">
            <p className="text-xs font-semibold text-green-400 mb-2">✅ After</p>
            <pre className="text-xs text-green-200 whitespace-pre-wrap">{`useSyncExternalStore(
  (cb) => {
    window.addEventListener('online', cb);
    return () => window.removeEventListener(...);
  },
  () => navigator.onLine, // client
  () => true,             // server
)`}</pre>
          </div>
        </div>
      </div>
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
