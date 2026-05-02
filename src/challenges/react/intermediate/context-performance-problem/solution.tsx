'use client';

/**
 * ✅ SOLUTION — Split contexts + memoized values
 *
 * Two techniques eliminate the wasted re-renders:
 *
 * 1. Split-context pattern:
 *    CountContext, ThemeContext, and ActionsContext are separate providers.
 *    A component that calls useContext(ActionsContext) is NOT subscribed to
 *    CountContext or ThemeContext — it simply never gets notified when those
 *    change. React's context subscription is per-context, not per-field.
 *
 * 2. Memoized context values:
 *    Each provider's `value` prop is wrapped in useMemo. This ensures the
 *    object reference only changes when the actual data changes. Without
 *    this, even stable data would produce a new object on every render of
 *    StoreSection, defeating the split.
 *
 * 3. Stable action callbacks:
 *    increment and toggleTheme are wrapped in useCallback(fn, []).
 *    Their references never change, so ActionsContext's useMemo deps
 *    are always satisfied — ActionsContext.Provider's value prop never
 *    gets a new reference. ActionButtons subscribes to it and never
 *    re-renders after mount.
 *
 * Result:
 *   +1 Count → only Counter re-renders (CountContext changed)
 *   Toggle Theme → only ThemeDisplay re-renders (ThemeContext changed)
 *   ActionButtons stays cold forever after mount.
 */

import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

// ── Inline UI primitives (Tailwind only) ─────────────────────────────────────

const Card = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`rounded-lg border bg-card text-card-foreground p-3 space-y-2 ${className}`}>
    {children}
  </div>
);

const Badge = ({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'muted';
}) => {
  const cls =
    variant === 'success'
      ? 'bg-green-500/20 text-green-600 dark:text-green-400'
      : variant === 'muted'
        ? 'bg-muted text-muted-foreground'
        : 'bg-secondary text-secondary-foreground';
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
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
    className={`inline-flex w-full items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
      variant === 'outline'
        ? 'border border-input bg-background hover:bg-accent'
        : 'bg-primary text-primary-foreground hover:bg-primary/90'
    }`}
  >
    {children}
  </button>
);

// ── Split contexts ─────────────────────────────────────────────────────────────

interface CountValue {
  count: number;
}
interface ThemeValue {
  theme: 'light' | 'dark';
}
interface ActionsValue {
  increment: () => void;
  toggleTheme: () => void;
}

// Three separate contexts — components only subscribe to what they need
const CountContext = createContext<CountValue | null>(null);
const ThemeContext = createContext<ThemeValue | null>(null);
const ActionsContext = createContext<ActionsValue | null>(null);

// Typed hooks — throw early if used outside providers
function useCount(): CountValue {
  const ctx = useContext(CountContext);
  if (ctx === null) throw new Error('useCount must be inside StoreSection');
  return ctx;
}
function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (ctx === null) throw new Error('useTheme must be inside StoreSection');
  return ctx;
}
function useActions(): ActionsValue {
  const ctx = useContext(ActionsContext);
  if (ctx === null) throw new Error('useActions must be inside StoreSection');
  return ctx;
}

// ── StoreSection — single state owner, three providers ───────────────────────

interface SectionProps {
  addLog: (msg: string) => void;
}

const StoreSection = memo(function StoreSection({ addLog }: SectionProps) {
  const [count, setCount] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // ✅ Stable action references — useCallback with [] means these never change.
  // ActionsContext's useMemo deps are [increment, toggleTheme] which never change,
  // so ActionsContext value is created exactly once and held forever.
  const increment = useCallback(() => setCount(c => c + 1), []);
  const toggleTheme = useCallback(() => setTheme(t => (t === 'light' ? 'dark' : 'light')), []);

  // ✅ Each context value is memoized separately — only changes when its own dep changes.
  // Clicking Increment changes countValue but NOT themeValue or actionsValue.
  const countValue = useMemo<CountValue>(() => ({ count }), [count]);
  const themeValue = useMemo<ThemeValue>(() => ({ theme }), [theme]);
  const actionsValue = useMemo<ActionsValue>(
    () => ({ increment, toggleTheme }),
    [increment, toggleTheme],
  );

  return (
    // Nested providers — the inner ones re-render when their parent re-renders,
    // but their `value` props are memoized, so context subscribers are unaffected.
    <CountContext.Provider value={countValue}>
      <ThemeContext.Provider value={themeValue}>
        <ActionsContext.Provider value={actionsValue}>
          <div className="grid grid-cols-3 gap-2">
            <Counter addLog={addLog} />
            <ThemeDisplay addLog={addLog} />
            <ActionButtons addLog={addLog} />
          </div>
        </ActionsContext.Provider>
      </ThemeContext.Provider>
    </CountContext.Provider>
  );
});

// ── Consumer components ───────────────────────────────────────────────────────

interface ConsumerProps {
  addLog: (msg: string) => void;
}

// Counter subscribes ONLY to CountContext — re-renders only when count changes
const Counter = memo(function Counter({ addLog }: ConsumerProps) {
  const { count } = useCount(); // ✅ isolated subscription
  const renderCount = useRef(0);
  renderCount.current += 1;
  const rc = renderCount.current;

  useEffect(() => {
    addLog(`🔵 Counter re-rendered (#${rc}) — count=${count}`);
  });

  return (
    <Card>
      <p className="text-xs text-muted-foreground font-mono">Counter</p>
      <p className="text-3xl font-bold tabular-nums">{count}</p>
      {/* Re-renders on every Increment — that's expected and correct */}
      <Badge>Renders: {rc}</Badge>
    </Card>
  );
});

// ThemeDisplay subscribes ONLY to ThemeContext — stays cold during count changes
const ThemeDisplay = memo(function ThemeDisplay({ addLog }: ConsumerProps) {
  const { theme } = useTheme(); // ✅ isolated subscription
  const renderCount = useRef(0);
  renderCount.current += 1;
  const rc = renderCount.current;

  useEffect(() => {
    addLog(`🟢 ThemeDisplay re-rendered (#${rc}) — theme=${theme}`);
  });

  return (
    <Card>
      <p className="text-xs text-muted-foreground font-mono">ThemeDisplay</p>
      <p className="text-3xl">{theme === 'light' ? '☀️' : '🌙'}</p>
      <p className="text-xs">{theme}</p>
      {/* Only re-renders when theme actually changes — no wasted renders */}
      <Badge variant="success">Renders: {rc}</Badge>
    </Card>
  );
});

// ActionButtons subscribes ONLY to ActionsContext — never re-renders after mount
const ActionButtons = memo(function ActionButtons({ addLog }: ConsumerProps) {
  const { increment, toggleTheme } = useActions(); // ✅ stable context — never changes
  const renderCount = useRef(0);
  renderCount.current += 1;
  const rc = renderCount.current;

  useEffect(() => {
    addLog(`🟢 ActionButtons re-rendered (#${rc})`);
  });

  return (
    <Card className="flex flex-col">
      <p className="text-xs text-muted-foreground font-mono">ActionButtons</p>
      <Button onClick={increment}>+1 Count</Button>
      <Button variant="outline" onClick={toggleTheme}>
        Toggle Theme
      </Button>
      {/* Should stay at 1 — ActionsContext value never changes */}
      <Badge variant="success">Renders: {rc}</Badge>
    </Card>
  );
});

// ── Root ──────────────────────────────────────────────────────────────────────

function Inner() {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 60));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">Context Re-render Performance</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Click <strong>+1 Count</strong> — only Counter re-renders now.
          ThemeDisplay and ActionButtons stay cold.
        </p>
      </div>

      <StoreSection addLog={addLog} />

      {/* Event log */}
      <div className="rounded-md border bg-muted/30 p-3 font-mono text-xs max-h-48 overflow-y-auto space-y-1">
        {logs.length === 0 ? (
          <p className="text-muted-foreground">No events yet… click +1 Count to start</p>
        ) : (
          logs.map((log, i) => <p key={i}>{log}</p>)
        )}
      </div>

      {/* Status badge strip */}
      <div className="flex flex-wrap gap-2 pt-2 border-t text-xs text-muted-foreground items-center">
        <span>After each +1 Count click:</span>
        <Badge variant="default">🔵 Counter renders +1</Badge>
        <Badge variant="success">🟢 ThemeDisplay stays cold</Badge>
        <Badge variant="success">🟢 ActionButtons stays cold</Badge>
      </div>

      {/* ── Explanation card ──────────────────────────────────────────────── */}
      <Card className="space-y-3">
        <p className="text-sm font-semibold">✅ Why This Works</p>
        <ul className="space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
          <li>
            <code className="rounded bg-muted px-1">useContext</code> re-renders on{' '}
            <em>any</em> context value change — not just the field the component reads.
            Splitting into separate contexts means components only subscribe to what they
            actually consume.
          </li>
          <li>
            Split contexts by update frequency: data that changes often (
            <code className="rounded bg-muted px-1">count</code>,{' '}
            <code className="rounded bg-muted px-1">theme</code>) vs actions that never change
            (stable <code className="rounded bg-muted px-1">useCallback</code> references).
          </li>
          <li>
            Memoize every context value object with{' '}
            <code className="rounded bg-muted px-1">useMemo</code> — React compares context
            values by reference. Without <code className="rounded bg-muted px-1">useMemo</code>,
            even stable data produces a new object on every provider re-render.
          </li>
        </ul>

        {/* Before / after code panel */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="rounded-md border border-red-800 bg-red-950/40 p-3">
            <p className="text-xs font-semibold text-red-400 mb-2">❌ Before</p>
            <pre className="text-xs text-red-200 whitespace-pre-wrap">{`// One context, new object every render
const value = {
  count, theme,
  increment, toggleTheme,
};
// Every consumer re-renders on
// ANY state change`}</pre>
          </div>
          <div className="rounded-md border border-green-800 bg-green-950/40 p-3">
            <p className="text-xs font-semibold text-green-400 mb-2">✅ After</p>
            <pre className="text-xs text-green-200 whitespace-pre-wrap">{`// Split + memoized context values
const countValue = useMemo(
  () => ({ count }), [count]);
const actionsValue = useMemo(
  () => ({ increment, toggleTheme }),
  [increment, toggleTheme]); // stable
// Each consumer only re-renders
// when its own context changes`}</pre>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function ContextPerformanceProblemSolution(): React.JSX.Element {
  return <Inner />;
}
