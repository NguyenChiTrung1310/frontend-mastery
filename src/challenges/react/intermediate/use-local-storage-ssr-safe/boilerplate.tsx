'use client';

/**
 * 🚧 BOILERPLATE
 *
 * useLocalStorageNaive has two bugs that only appear in SSR environments:
 *
 * Bug 1 — "localStorage is not defined" crash:
 *   localStorage.getItem(key) is passed directly as the useState argument.
 *   In Node.js (Next.js SSR), the `window` global doesn't exist — this line
 *   throws ReferenceError and crashes the entire server render.
 *
 * Bug 2 — Hydration mismatch:
 *   The server renders the component with defaultValue ('light').
 *   The client initializes from localStorage and may get 'dark'.
 *   React finds a mismatch between the server HTML and client render.
 *
 * The simulation panels below make both bugs visible even though
 * this project is client-only (no actual server crash here).
 *
 * Hints:
 *  - Pass a FUNCTION to useState to prevent eager evaluation: useState(() => ...)
 *  - Guard the function body: if (typeof window === 'undefined') return defaultValue
 *  - For zero hydration mismatch: start with useState(defaultValue), then sync
 *    the stored value inside useEffect (runs only after hydration)
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

// ── ❌ Naive hook — two SSR bugs ──────────────────────────────────────────────
//
// ❌ TODO: Fix this hook so it is SSR-safe and hydration-safe.
//   Step 1: change useState(localStorage.getItem(key) ?? defaultValue)
//           to:    useState(() => typeof window !== 'undefined'
//                    ? localStorage.getItem(key) ?? defaultValue : defaultValue)
//   Step 2: alternatively, start with useState(defaultValue) and sync
//           from localStorage inside useEffect for zero hydration mismatch.

function useLocalStorageNaive(key: string, defaultValue: Theme): [Theme, (v: Theme) => void] {
  // ❌ Bug 1: Direct call — evaluated on mount AND every re-render.
  //          Throws ReferenceError in SSR (no window/localStorage on the server).
  // ❌ Bug 2: Not a lazy initializer — React evaluates this BEFORE calling useState.
  //          No typeof window guard means the server crashes before returning HTML.
  const stored = localStorage.getItem(key);
  const [value, setValue] = useState<Theme>(
    stored === 'light' || stored === 'dark' ? stored : defaultValue,
  );

  function setStored(newValue: Theme) {
    setValue(newValue);
    localStorage.setItem(key, newValue);
  }

  return [value, setStored];
}

// ── Simulation state types ────────────────────────────────────────────────────

interface HydrationInfo {
  serverValue: Theme;
  clientValue: Theme;
  hasMismatch: boolean;
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function UseLocalStorageSsrSafeBoilerplate(): React.JSX.Element {
  const [theme, setTheme] = useLocalStorageNaive(THEME_KEY, DEFAULT_THEME);
  const [ssrError, setSsrError] = useState<string | null>(null);
  const [hydrationInfo, setHydrationInfo] = useState<HydrationInfo | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
  }, []);

  useEffect(() => {
    // Pre-seed localStorage to simulate a returning user who set dark mode.
    // This ensures the hydration mismatch is visible immediately.
    if (!localStorage.getItem(THEME_KEY)) {
      localStorage.setItem(THEME_KEY, 'dark');
      addLog('💾 Pre-seeded: localStorage["' + THEME_KEY + '"] = "dark" (returning user)');
    }

    addLog('🚀 Component mounted — running SSR simulation…');

    // ── Simulate Bug 1: SSR execution ───────────────────────────────────────
    // In SSR (Node.js), window is undefined, so localStorage doesn't exist.
    // The naive hook calls localStorage.getItem() before the window guard runs.
    // We reproduce what the server would do: call the problematic line, catch the error.
    try {
      // This represents the naive hook running on the server.
      // We explicitly throw to reproduce the SSR environment.
      throw new ReferenceError('localStorage is not defined');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setSsrError(msg);
      addLog('💥 SSR error: ' + msg);
    }

    // ── Simulate Bug 2: Hydration mismatch ─────────────────────────────────
    // The server renders with defaultValue (no localStorage → uses 'light').
    // The client hydrates and reads the stored value from localStorage.
    // If stored ≠ default → React detects a mismatch.
    const serverValue: Theme = DEFAULT_THEME; // what server would render
    const rawStored = localStorage.getItem(THEME_KEY);
    const clientValue: Theme = rawStored === 'dark' ? 'dark' : DEFAULT_THEME;
    const hasMismatch = serverValue !== clientValue;

    setHydrationInfo({ serverValue, clientValue, hasMismatch });

    if (hasMismatch) {
      addLog(`⚠️ Hydration mismatch: server="${serverValue}", client="${clientValue}"`);
      addLog('📢 React would warn: "Text content did not match. Server: light Client: dark"');
    } else {
      addLog(`✓ No mismatch (server="${serverValue}", client="${clientValue}")`);
    }
  }, [addLog]);

  function toggleTheme() {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    addLog(`🎨 Theme toggled: ${theme} → ${next}`);

    // Update hydration info to reflect the new stored value
    setHydrationInfo(prev =>
      prev ? { ...prev, clientValue: next, hasMismatch: DEFAULT_THEME !== next } : prev,
    );
  }

  function clearStorage() {
    localStorage.removeItem(THEME_KEY);
    setTheme(DEFAULT_THEME);
    setHydrationInfo(prev =>
      prev ? { ...prev, clientValue: DEFAULT_THEME, hasMismatch: false } : prev,
    );
    addLog('🗑️ Cleared localStorage — theme reset to default');
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">SSR-Safe useLocalStorage</h2>
        <p className="text-xs text-muted-foreground mt-1">
          The naive hook breaks in SSR. Observe both bugs in the simulation panels below.
        </p>
      </div>

      {/* ── Theme Demo Card ────────────────────────────────────────────────── */}
      <Card className="space-y-3">
        <p className="text-xs text-muted-foreground font-mono">Theme Preference (browser works)</p>
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

      {/* ── Bug 1: SSR Error Simulation ────────────────────────────────────── */}
      <Card className="space-y-2">
        <p className="text-sm font-semibold">🖥️ Bug 1 — SSR Execution</p>
        <p className="text-xs text-muted-foreground">
          The problematic line as it runs in a Node.js (server) environment:
        </p>
        <div className="rounded-md border border-muted bg-muted/30 p-2 font-mono text-xs">
          <span className="text-muted-foreground">{'// useState initializer (runs on server)'}</span>
          <br />
          <span className="text-foreground">
            {'const stored = '}
            <span className="text-destructive font-semibold">localStorage</span>
            {'.getItem(key); ← 💥 here'}
          </span>
        </div>
        {ssrError !== null ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3">
            <p className="text-xs font-semibold text-destructive">
              💥 ReferenceError: {ssrError}
            </p>
            <p className="text-xs text-destructive/80 mt-1">
              The server render crashes. No HTML is sent to the browser.
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Running simulation…</p>
        )}
      </Card>

      {/* ── Bug 2: Hydration Mismatch Simulation ───────────────────────────── */}
      <Card className="space-y-2">
        <p className="text-sm font-semibold">🌊 Bug 2 — Hydration Mismatch</p>
        <p className="text-xs text-muted-foreground">
          Server renders with default. Client hydrates with stored value. If they differ,
          React warns.
        </p>
        {hydrationInfo !== null ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-md border bg-muted/30 p-2 text-xs">
                <p className="text-muted-foreground font-mono mb-1">🖥️ Server renders:</p>
                <p className="font-semibold">
                  &quot;{hydrationInfo.serverValue}&quot;{' '}
                  <span className="text-muted-foreground">(no localStorage)</span>
                </p>
              </div>
              <div className="rounded-md border bg-muted/30 p-2 text-xs">
                <p className="text-muted-foreground font-mono mb-1">🌐 Client hydrates:</p>
                <p className="font-semibold">
                  &quot;{hydrationInfo.clientValue}&quot;{' '}
                  <span className="text-muted-foreground">(from localStorage)</span>
                </p>
              </div>
            </div>
            {hydrationInfo.hasMismatch ? (
              <div className="rounded-md border border-yellow-600/40 bg-yellow-500/10 p-2 text-xs text-yellow-600 dark:text-yellow-400">
                ⚠️ <strong>Mismatch detected!</strong> React would warn:{' '}
                <code className="rounded bg-yellow-500/20 px-1">
                  &quot;Text content did not match. Server: {hydrationInfo.serverValue} Client:{' '}
                  {hydrationInfo.clientValue}&quot;
                </code>
              </div>
            ) : (
              <div className="rounded-md border border-muted bg-muted/30 p-2 text-xs text-muted-foreground">
                ✓ Values match — toggle theme to see the mismatch appear
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Loading simulation…</p>
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
        <Badge variant={ssrError !== null ? 'destructive' : 'muted'}>
          {ssrError !== null ? '💥 SSR crash' : '⏳ checking'}
        </Badge>
        <Badge
          variant={
            hydrationInfo?.hasMismatch === true
              ? 'warning'
              : hydrationInfo?.hasMismatch === false
                ? 'muted'
                : 'muted'
          }
        >
          {hydrationInfo?.hasMismatch === true
            ? '⚠️ Hydration mismatch'
            : hydrationInfo?.hasMismatch === false
              ? '✓ No mismatch'
              : '⏳ checking'}
        </Badge>
      </div>
    </div>
  );
}
