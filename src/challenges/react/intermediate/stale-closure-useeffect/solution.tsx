'use client';

/**
 * ✅ SOLUTION — Stale Closure fixed with useRef
 *
 * The fix: a `countRef` is kept in sync with `count` via a dedicated
 * useEffect. The setTimeout callback reads `countRef.current` instead of
 * the stale `count` variable. Because `countRef` is the same object
 * reference across all renders, the callback always reads the latest value.
 *
 * Why useRef over adding `count` to deps?
 *   Adding `count` to the setTimeout effect's deps causes it to re-run —
 *   and reschedule the timer — on every increment. If the user increments
 *   rapidly, the countdown restarts each time. A ref lets the timer fire
 *   exactly once while still reading the live value at fire time.
 *
 * The mental model:
 *   - State     → drives rendering, immutable per render
 *   - Ref       → mutable side-channel, invisible to React's render cycle
 *   - Closure   → captures state by value at creation; captures ref by reference
 *
 * Async/effect analogy:
 *   The same pattern applies to event listeners and intersection observers —
 *   any callback registered once that needs to read evolving state should use
 *   a ref rather than close over state directly.
 */

import { useEffect, useRef, useState } from 'react';

// ─── Inline UI primitives (Tailwind only) ────────────────────────────────────

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
    {children}
  </div>
);

const Badge = ({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'warning' | 'success' | 'outline';
}) => {
  const styles: Record<string, string> = {
    default: 'bg-primary/10 text-primary border-primary/20',
    warning: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    success: 'bg-green-500/15 text-green-400 border-green-500/30',
    outline: 'bg-transparent text-muted-foreground border-border',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
};

const Button = ({
  children,
  onClick,
  variant = 'default',
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'outline';
  disabled?: boolean;
}) => {
  const styles = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50',
    outline: 'border border-border bg-background hover:bg-muted text-foreground disabled:opacity-50',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${styles[variant]}`}
    >
      {children}
    </button>
  );
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface LogEntry {
  id: number;
  time: string;
  message: string;
  isCorrect?: boolean;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function StaleClosureUseEffectSolution(): React.JSX.Element {
  const [count, setCount] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [announcing, setAnnouncing] = useState(false);
  const logIdRef = useRef(0);

  // ✅ Keep a mutable ref in sync with count.
  // This runs after every render where count changed — O(1), no side effects.
  // The ref itself is stable (same object), so closures over it read live data.
  const countRef = useRef(count);
  useEffect(() => {
    countRef.current = count;
  }, [count]);

  const addLog = (message: string, isCorrect?: boolean) => {
    logIdRef.current += 1;
    const entry: LogEntry = {
      id: logIdRef.current,
      time: new Date().toLocaleTimeString(),
      message,
      isCorrect,
    };
    setLogs((prev) => [entry, ...prev].slice(0, 30));
  };

  const handleAnnounce = () => {
    if (announcing) return;
    setAnnouncing(true);
    addLog(`📣 Scheduled announcement (count is ${count} now)…`);

    setTimeout(() => {
      // ✅ Read countRef.current — always the latest count, not a stale closure value.
      // countRef is the same object reference that was created on mount; its .current
      // field was mutated by the sync effect above, so this is always fresh.
      const liveCount = countRef.current;
      addLog(`🔔 Announced: count is ${liveCount} ✅ (correct)`, true);
      setAnnouncing(false);
    }, 2000);
    // No deps needed — the callback intentionally runs once per click.
    // It reads live state via ref, not via closure.
  };

  const handleIncrement = () => {
    setCount((c) => c + 1);
    addLog(`➕ Incremented to ${count + 1}`);
  };

  const handleReset = () => {
    setCount(0);
    setLogs([]);
    setAnnouncing(false);
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <div>
        <h2 className="text-base font-semibold">Stale Closure — Fixed with useRef</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Click Announce, increment rapidly — the announced value is always correct.
        </p>
      </div>

      {/* Counter display */}
      <Card className="p-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Current count</p>
          <p className="text-4xl font-mono font-bold">{count}</p>
        </div>
        <div className="flex flex-col gap-2">
          <Button onClick={handleIncrement}>➕ Increment</Button>
          <Button onClick={handleReset} variant="outline">↺ Reset</Button>
        </div>
      </Card>

      {/* Announce button */}
      <Button onClick={handleAnnounce} disabled={announcing} variant="outline">
        {announcing ? '⏳ Announcing in 2s…' : '📣 Announce in 2s'}
      </Button>

      {/* Confirmation that it worked */}
      {!announcing && logs.some((l) => l.isCorrect) && (
        <div className="rounded-md border border-green-500/40 bg-green-500/10 px-3 py-2">
          <p className="text-sm font-semibold text-green-400">
            ✅ Correct! The announced value matched the live count.
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            countRef.current gave us the latest value, bypassing the stale closure.
          </p>
        </div>
      )}

      {/* Event log */}
      <Card className="p-3">
        <p className="text-xs font-semibold text-muted-foreground mb-2">Event Log</p>
        <div className="rounded-md border bg-muted/30 p-3 font-mono text-xs max-h-48 overflow-y-auto space-y-1">
          {logs.length === 0 ? (
            <p className="text-muted-foreground">No events yet…</p>
          ) : (
            logs.map((log) => (
              <p key={log.id} className={log.isCorrect ? 'text-green-400' : undefined}>
                [{log.time}] {log.message}
              </p>
            ))
          )}
        </div>
      </Card>

      {/* Status strip */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">count: {count}</Badge>
        <Badge variant="outline">countRef: {countRef.current}</Badge>
        <Badge variant={announcing ? 'warning' : 'success'}>
          {announcing ? '⏳ timer running' : '✅ no stale reads'}
        </Badge>
      </div>

      {/* Explanation card */}
      <Card className="p-4 space-y-3">
        <p className="text-sm font-semibold">✅ Why This Works</p>
        <ul className="space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
          <li>
            <span className="text-foreground font-medium">Closures capture the value at creation time, not at call time</span>
            {' '}— the setTimeout callback closed over count = 0 from mount, so it always read 0 regardless of later increments.
          </li>
          <li>
            <span className="text-foreground font-medium">useRef gives effects a live mutable reference without deps re-runs</span>
            {' '}— countRef is the same object reference on every render; only its .current field changes, and that change is invisible to React.
          </li>
          <li>
            <span className="text-foreground font-medium">Adding count to deps also fixes it but restarts the timer on every increment</span>
            {' '}— the ref approach lets the timer fire exactly once while still reading the latest value at fire time.
          </li>
        </ul>

        {/* Before / after */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="rounded-md border border-red-800 bg-red-950/40 p-3">
            <p className="text-xs font-semibold text-red-400 mb-2">❌ Before</p>
            <pre className="text-xs text-red-200 whitespace-pre-wrap">{`setTimeout(() => {
  log(\`Count is \${count}\`);
  // count is stale — frozen
  // at render-time value
}, 2000);`}</pre>
          </div>
          <div className="rounded-md border border-green-800 bg-green-950/40 p-3">
            <p className="text-xs font-semibold text-green-400 mb-2">✅ After</p>
            <pre className="text-xs text-green-200 whitespace-pre-wrap">{`const countRef = useRef(count);
useEffect(() => {
  countRef.current = count;
}, [count]);

setTimeout(() => {
  log(\`Count is \${countRef.current}\`);
  // always reads latest value
}, 2000);`}</pre>
          </div>
        </div>
      </Card>
    </div>
  );
}
