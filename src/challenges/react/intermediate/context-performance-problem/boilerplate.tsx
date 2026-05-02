'use client';

/**
 * 🚧 BOILERPLATE
 *
 * StoreContext merges count, theme, and actions into a single value object.
 * Every call to useContext(StoreContext) re-renders whenever ANY field changes —
 * even if that component only reads one field.
 *
 * Try it:
 *   1. Click "+1 Count" several times. Watch ALL THREE render-count badges climb.
 *   2. ThemeDisplay re-rendered — but theme didn't change!
 *   3. ActionButtons re-rendered — but the buttons didn't change!
 *
 * Hints:
 *  - The root cause: `value = { count, theme, increment, toggleTheme }` creates
 *    a new object on every render, so React sees a changed value every time.
 *  - Fix A (partial): wrap value in useMemo. Still re-renders everything when
 *    count changes, because count and theme share the same object.
 *  - Fix B (full): split into CountContext, ThemeContext, ActionsContext.
 *    Consumers only subscribe to the context they actually need.
 *    Wrap actions in useCallback so ActionsContext never changes reference.
 */

import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
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
  variant?: 'default' | 'destructive' | 'muted';
}) => {
  const cls =
    variant === 'destructive'
      ? 'bg-destructive/20 text-destructive'
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

// ── Context ───────────────────────────────────────────────────────────────────

interface StoreValue {
  count: number;
  theme: 'light' | 'dark';
  increment: () => void;
  toggleTheme: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (ctx === null) throw new Error('useStore must be inside StoreSection');
  return ctx;
}

// ── StoreSection — holds all state, provides merged context ──────────────────
// memo'd so that Inner re-renders (from log updates) don't cascade into this tree.

interface SectionProps {
  addLog: (msg: string) => void;
}

const StoreSection = memo(function StoreSection({ addLog }: SectionProps) {
  const [count, setCount] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const increment = () => setCount(c => c + 1);
  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));

  // ❌ New object reference on every render of StoreSection.
  // React compares context values by reference (Object.is).
  // Any state change here re-renders every consumer, regardless of which field changed.
  const value: StoreValue = { count, theme, increment, toggleTheme };

  return (
    <StoreContext.Provider value={value}>
      <div className="grid grid-cols-3 gap-2">
        <Counter addLog={addLog} />
        <ThemeDisplay addLog={addLog} />
        <ActionButtons addLog={addLog} />
      </div>
    </StoreContext.Provider>
  );
});

// ── Consumer components ───────────────────────────────────────────────────────
// All wrapped in memo to isolate context-caused re-renders from prop changes.

interface ConsumerProps {
  addLog: (msg: string) => void;
}

// Counter only needs `count` — but re-renders on theme changes too
const Counter = memo(function Counter({ addLog }: ConsumerProps) {
  const { count } = useStore();
  const renderCount = useRef(0);
  renderCount.current += 1;
  const rc = renderCount.current;

  // Log every render after commit (no deps = runs after every render of this component)
  useEffect(() => {
    addLog(`🔵 Counter re-rendered (#${rc}) — count=${count}`);
  });

  return (
    <Card>
      <p className="text-xs text-muted-foreground font-mono">Counter</p>
      <p className="text-3xl font-bold tabular-nums">{count}</p>
      <Badge>Renders: {rc}</Badge>
    </Card>
  );
});

// ThemeDisplay only needs `theme` — but re-renders on every count change too
const ThemeDisplay = memo(function ThemeDisplay({ addLog }: ConsumerProps) {
  const { theme } = useStore();
  const renderCount = useRef(0);
  renderCount.current += 1;
  const rc = renderCount.current;

  useEffect(() => {
    addLog(`🔴 ThemeDisplay re-rendered (#${rc}) — theme=${theme}`);
  });

  return (
    <Card>
      <p className="text-xs text-muted-foreground font-mono">ThemeDisplay</p>
      <p className="text-3xl">{theme === 'light' ? '☀️' : '🌙'}</p>
      <p className="text-xs">{theme}</p>
      {/* This render count should only go up when theme actually changes */}
      <Badge variant="destructive">Renders: {rc}</Badge>
    </Card>
  );
});

// ActionButtons only needs increment + toggleTheme — but re-renders on count+theme changes too
const ActionButtons = memo(function ActionButtons({ addLog }: ConsumerProps) {
  const { increment, toggleTheme } = useStore();
  const renderCount = useRef(0);
  renderCount.current += 1;
  const rc = renderCount.current;

  useEffect(() => {
    addLog(`🟡 ActionButtons re-rendered (#${rc})`);
  });

  return (
    <Card className="flex flex-col">
      <p className="text-xs text-muted-foreground font-mono">ActionButtons</p>
      <Button onClick={increment}>+1 Count</Button>
      <Button variant="outline" onClick={toggleTheme}>
        Toggle Theme
      </Button>
      {/* This should NEVER re-render after mount — actions don't change */}
      <Badge variant="destructive">Renders: {rc}</Badge>
    </Card>
  );
});

// ── Root ──────────────────────────────────────────────────────────────────────
// Inner holds the log state. memo on StoreSection prevents log updates from
// cascading into the context provider tree.

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
          Click <strong>+1 Count</strong> — watch all three render counts climb, even though
          only Counter needed to update.
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
        <Badge variant="destructive">🔴 ThemeDisplay renders +1 (wasteful!)</Badge>
        <Badge variant="destructive">🟡 ActionButtons renders +1 (wasteful!)</Badge>
      </div>
    </div>
  );
}

export default function ContextPerformanceProblemBoilerplate(): React.JSX.Element {
  return <Inner />;
}
