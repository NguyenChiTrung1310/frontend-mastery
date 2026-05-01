'use client';

/**
 * 🚧 BOILERPLATE
 *
 * A counter with an "📣 Announce in 2s" button. Clicking it sets a trigger
 * flag that causes a useEffect to run a setTimeout logging the count.
 *
 * Bug: the setTimeout callback closes over `count` from the render when the
 * effect first ran — it always reads 0. Click Announce, increment rapidly,
 * and the announced value is always stale. The 🕰️ alert fires to confirm.
 *
 * Hints:
 *  - The useEffect deps array is empty `[]` — the effect never re-runs, so
 *    `count` inside it is permanently frozen at the initial value.
 *  - Fix 1 (deps): add `count` to the deps so the effect re-runs each time
 *    count changes, always capturing the latest value.
 *  - Fix 2 (ref): sync count into a useRef and read ref.current inside the
 *    callback — the ref is the same object across renders, so it's always live.
 *  - The exhaustive-deps ESLint rule warns about exactly this pattern.
 */

import { useEffect, useRef, useState } from 'react';

// ─── Inline UI primitives (Tailwind only, no shadcn imports) ─────────────────

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
  isStale?: boolean;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function StaleClosureUseEffectBoilerplate(): React.JSX.Element {
  const [count, setCount] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [announcing, setAnnouncing] = useState(false);
  const [staleAlert, setStaleAlert] = useState<{ announced: number; current: number } | null>(null);
  // Incrementing this triggers the announce effect below
  const [announceTrigger, setAnnounceTrigger] = useState(0);
  const logIdRef = useRef(0);
  // Record count at click time so we can detect if the announced value is stale
  const countAtClickRef = useRef(0);

  const addLog = (message: string, isStale = false) => {
    logIdRef.current += 1;
    const entry: LogEntry = {
      id: logIdRef.current,
      time: new Date().toLocaleTimeString(),
      message,
      isStale,
    };
    setLogs((prev) => [entry, ...prev].slice(0, 30));
  };

  // ❌ TODO: stale closure bug lives here.
  // `count` inside this effect is frozen at the value from the render when
  // the effect last ran. With empty deps `[]`, it ran once — on mount — so
  // `count` is always 0 inside the setTimeout callback, no matter how many
  // times you increment after clicking Announce.
  //
  // Fix options (pick one):
  //   Option A — add `count` to the deps array so the effect re-runs fresh
  //   Option B — sync count into a useRef and read ref.current in the callback
  /* eslint-disable react-hooks/exhaustive-deps */
  // Intentional stale closure: `count` is deliberately omitted from deps.
  // The missing dep IS the bug the learner must diagnose and fix.
  useEffect(() => {
    if (announceTrigger === 0) return;

    const timerId = setTimeout(() => {
      // ❌ `count` is stale — frozen at the value when this effect last ran
      const announcedValue = count;
      addLog(`🔔 Announced: count is ${announcedValue}`, announcedValue !== countAtClickRef.current);
      setAnnouncing(false);
      setCount((liveCount) => {
        if (announcedValue !== liveCount) {
          setStaleAlert({ announced: announcedValue, current: liveCount });
        }
        return liveCount;
      });
    }, 2000);

    return () => clearTimeout(timerId);
  }, [announceTrigger]); // ← `count` is missing — that's the bug
  /* eslint-enable react-hooks/exhaustive-deps */

  const handleAnnounce = () => {
    if (announcing) return;
    countAtClickRef.current = count;
    setAnnouncing(true);
    setStaleAlert(null);
    addLog(`📣 Scheduled announcement (count is ${count} now)…`);
    setAnnounceTrigger((t) => t + 1);
  };

  const handleIncrement = () => {
    setCount((c) => {
      addLog(`➕ Incremented to ${c + 1}`);
      return c + 1;
    });
  };

  const handleReset = () => {
    setCount(0);
    setLogs([]);
    setStaleAlert(null);
    setAnnouncing(false);
    setAnnounceTrigger(0);
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <div>
        <h2 className="text-base font-semibold">Stale Closure in useEffect</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Click Announce, then increment rapidly. The announced value will be wrong.
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

      {/* Stale value alert */}
      {staleAlert && (
        <div className="rounded-md border border-yellow-500/40 bg-yellow-500/10 px-3 py-2">
          <p className="text-sm font-semibold text-yellow-400">
            🕰️ Stale Value! Announced {staleAlert.announced} but current is {staleAlert.current}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            The useEffect callback read a stale closure — count was missing from deps.
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
              <p key={log.id} className={log.isStale ? 'text-yellow-400' : undefined}>
                [{log.time}] {log.message}
              </p>
            ))
          )}
        </div>
      </Card>

      {/* Status strip */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">count: {count}</Badge>
        <Badge variant={announcing ? 'warning' : 'outline'}>
          {announcing ? '⏳ timer running' : 'idle'}
        </Badge>
        <Badge variant={staleAlert ? 'warning' : 'outline'}>
          {staleAlert
            ? `⚠️ stale: got ${staleAlert.announced}, expected ${staleAlert.current}`
            : 'no stale read'}
        </Badge>
      </div>
    </div>
  );
}
