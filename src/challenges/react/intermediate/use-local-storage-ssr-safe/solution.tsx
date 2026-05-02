'use client';

/**
 * ✅ SOLUTION — SSR-safe useLocalStorage with useEffect post-hydration sync
 *
 * Two problems are fixed with two complementary techniques:
 *
 * 1. Start with useState(defaultValue):
 *    Both the server and client render produce the same output initially.
 *    React's hydration check passes — no mismatch warning.
 *
 * 2. Sync from localStorage inside useEffect:
 *    useEffect runs only in the browser, after React has committed the
 *    server-rendered HTML. Reading localStorage here is always safe.
 *    If the stored value differs from the default, one state update fires
 *    — expected client-side behavior, NOT a hydration error.
 *
 * Tradeoff: there is one render with defaultValue before the stored value
 * loads (a brief flash). For theme preferences this is acceptable. For
 * content that must match instantly, guard with a mounted state and render
 * a skeleton until the effect fires.
 *
 * Bonus: a 'storage' event listener keeps multiple tabs in sync.
 */

import { useCallback, useEffect, useState } from 'react';

// ── Inline UI primitives (Tailwind only) ─────────────────────────────────────

const Card = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`rounded-lg border bg-card text-card-foreground p-4 ${className}`}>
    {children}
  </div>
);

const Badge = ({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'muted';
}) => {
  const cls =
    variant === 'destructive'
      ? 'bg-destructive/20 text-destructive'
      : variant === 'success'
        ? 'bg-green-500/20 text-green-600 dark:text-green-400'
        : variant === 'warning'
          ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
          : variant === 'muted'
            ? 'bg-muted text-muted-foreground'
            : 'bg-secondary text-secondary-foreground';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}
    >
      {children}
    </span>
  );
};

const Button = ({
  children,
  onClick,
  variant = 'default',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'outline';
}) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors ${
      variant === 'outline'
        ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
        : 'bg-primary text-primary-foreground hover:bg-primary/90'
    }`}
  >
    {children}
  </button>
);

// ── Constants ─────────────────────────────────────────────────────────────────

const THEME_KEY = 'frontend-mastery-challenge-theme';
const DEFAULT_THEME = 'light' as const;
type Theme = 'light' | 'dark';

// ── ✅ Fixed hook — generic, SSR-safe, hydration-safe ────────────────────────

function useLocalStorage<T extends string>(
  key: string,
  defaultValue: T,
): [T, (v: T) => void] {
  // ✅ Start with defaultValue — identical on server and client.
  // React's hydration check finds matching output → no mismatch warning.
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    // ✅ useEffect runs only in the browser, after hydration is complete.
    // Reading localStorage here is always safe — window is guaranteed to exist.
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        setValue(stored as T); // one post-hydration update — not a hydration error
      }
    } catch {
      // Storage unavailable (private browsing, quota) — stay on default
    }
  }, [key]);

  // ✅ Cross-tab sync: 'storage' fires in ALL OTHER tabs when the key changes.
  // This keeps the UI consistent without polling.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === key && e.newValue !== null) {
        setValue(e.newValue as T);
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key]);

  function setStored(newValue: T) {
    setValue(newValue);
    try {
      localStorage.setItem(key, newValue);
    } catch {
      // Storage write failed — UI update still applies
    }
  }

  return [value, setStored];
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function UseLocalStorageSsrSafeSolution(): React.JSX.Element {
  const [theme, setTheme] = useLocalStorage<Theme>(THEME_KEY, DEFAULT_THEME);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
  }, []);

  useEffect(() => {
    // Pre-seed if empty (consistent with boilerplate for fair comparison)
    if (!localStorage.getItem(THEME_KEY)) {
      localStorage.setItem(THEME_KEY, 'dark');
    }
    addLog('🚀 Component mounted');
    addLog('🖥️ Server render: state = "light" (defaultValue) — ✅ No SSR error');
    addLog('🌐 Client hydrate: state = "light" — ✅ Matches server, no mismatch');
    addLog('⚡ useEffect fires: syncing from localStorage…');
  }, [addLog]);

  // Log when theme changes post-hydration
  useEffect(() => {
    if (theme !== DEFAULT_THEME) {
      addLog(`💾 Post-hydration sync: state updated to "${theme}" from localStorage`);
    }
  }, [theme, addLog]);

  function toggleTheme() {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    addLog(`🎨 Theme toggled: ${theme} → ${next}`);
  }

  function clearStorage() {
    localStorage.removeItem(THEME_KEY);
    setTheme(DEFAULT_THEME);
    addLog('🗑️ Cleared localStorage — theme reset to default');
  }

  // What the server would have rendered (always defaultValue in SSR)
  const serverValue = DEFAULT_THEME;
  const hasMismatch = false; // the fix ensures there is never a mismatch

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">SSR-Safe useLocalStorage</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Starts with defaultValue (SSR-safe), then syncs via useEffect after hydration.
        </p>
      </div>

      {/* ── Theme Demo Card ────────────────────────────────────────────────── */}
      <Card className="space-y-3">
        <p className="text-xs text-muted-foreground font-mono">Theme Preference (SSR-safe)</p>
        <div
          className={`rounded-lg p-4 text-center transition-colors ${
            theme === 'dark'
              ? 'bg-gray-800 text-gray-100'
              : 'bg-gray-50 border border-gray-200 text-gray-900'
          }`}
        >
          <p className="text-3xl mb-1">{theme === 'dark' ? '🌙' : '☀️'}</p>
          <p className="text-sm font-semibold">{theme} mode</p>
          <p className="text-xs opacity-60 mt-0.5">
            localStorage[&quot;{THEME_KEY}&quot;] = &quot;{theme}&quot;
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={toggleTheme}>Toggle Theme</Button>
          <Button variant="outline" onClick={clearStorage}>
            Clear Storage
          </Button>
        </div>
      </Card>

      {/* ── ✅ SSR Safe Panel ──────────────────────────────────────────────── */}
      <Card className="space-y-2">
        <p className="text-sm font-semibold">🖥️ SSR Execution</p>
        <div className="rounded-md border border-muted bg-muted/30 p-2 font-mono text-xs">
          <span className="text-muted-foreground">{'// useState initializer (safe)'}</span>
          <br />
          <span className="text-foreground">
            {'const [value, setValue] = '}
            <span className="text-green-500 font-semibold">{'useState(defaultValue)'}</span>
            {' ← ✅ no localStorage call'}
          </span>
        </div>
        <div className="rounded-md border border-green-700/30 bg-green-500/10 p-3">
          <p className="text-xs font-semibold text-green-600 dark:text-green-400">
            ✅ No SSR error
          </p>
          <p className="text-xs text-green-600/80 dark:text-green-400/80 mt-1">
            The hook never touches localStorage during render. The server produces valid HTML.
          </p>
        </div>
      </Card>

      {/* ── ✅ Hydration Safe Panel ────────────────────────────────────────── */}
      <Card className="space-y-2">
        <p className="text-sm font-semibold">🌊 Hydration</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md border bg-muted/30 p-2 text-xs">
            <p className="text-muted-foreground font-mono mb-1">🖥️ Server renders:</p>
            <p className="font-semibold">&quot;{serverValue}&quot;</p>
          </div>
          <div className="rounded-md border bg-muted/30 p-2 text-xs">
            <p className="text-muted-foreground font-mono mb-1">🌐 Client starts:</p>
            <p className="font-semibold">&quot;{serverValue}&quot; ← same</p>
          </div>
        </div>
        {!hasMismatch && (
          <div className="rounded-md border border-green-700/30 bg-green-500/10 p-2 text-xs text-green-600 dark:text-green-400">
            ✅ <strong>No mismatch.</strong> After hydration, useEffect syncs to the stored
            value. This is a normal client-side update — not a hydration error.
          </div>
        )}
      </Card>

      {/* ── Event log ─────────────────────────────────────────────────────── */}
      <div className="rounded-md border bg-muted/30 p-3 font-mono text-xs max-h-48 overflow-y-auto space-y-1">
        {logs.length === 0 ? (
          <p className="text-muted-foreground">No events yet…</p>
        ) : (
          logs.map((log, i) => <p key={i}>{log}</p>)
        )}
      </div>

      {/* ── Status badge strip ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 pt-2 border-t">
        <Badge>theme: &quot;{theme}&quot;</Badge>
        <Badge variant="success">✅ SSR safe</Badge>
        <Badge variant="success">✅ No hydration mismatch</Badge>
        <Badge variant="success">✅ Cross-tab sync</Badge>
      </div>

      {/* ── Explanation card ───────────────────────────────────────────────── */}
      <Card className="space-y-3">
        <p className="text-sm font-semibold">✅ Why This Works</p>
        <ul className="space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
          <li>
            The <strong>lazy useState initializer</strong> (function form) runs once on mount —
            only on the client, never during SSR. Adding a{' '}
            <code className="rounded bg-muted px-1">typeof window === &apos;undefined&apos;</code>{' '}
            guard inside it makes the function server-safe if you need client-first init.
          </li>
          <li>
            <strong>Starting with the default</strong> ensures server and client produce
            identical output during hydration. React compares them, finds a match, and
            commits the server HTML with no re-render.
          </li>
          <li>
            <strong>useEffect for post-hydration sync</strong>: React guarantees effects run
            only in the browser, after hydration is complete. Reading{' '}
            <code className="rounded bg-muted px-1">localStorage</code> here is always safe —{' '}
            <code className="rounded bg-muted px-1">window</code> is guaranteed to exist.
          </li>
        </ul>

        {/* Before / after code panel */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="rounded-md border border-red-800 bg-red-950/40 p-3">
            <p className="text-xs font-semibold text-red-400 mb-2">❌ Before</p>
            <pre className="text-xs text-red-200 whitespace-pre-wrap">{`// Eager — throws on server
const [value, setValue] = useState(
  localStorage.getItem(key) // 💥
  ?? defaultValue
);`}</pre>
          </div>
          <div className="rounded-md border border-green-800 bg-green-950/40 p-3">
            <p className="text-xs font-semibold text-green-400 mb-2">✅ After</p>
            <pre className="text-xs text-green-200 whitespace-pre-wrap">{`// Start with default (SSR-safe)
const [value, setValue] =
  useState(defaultValue);

// Sync after hydration
useEffect(() => {
  const s = localStorage.getItem(key);
  if (s !== null) setValue(s as T);
}, [key]);`}</pre>
          </div>
        </div>
      </Card>
    </div>
  );
}
