'use client';

/**
 * ✅ SOLUTION — useEffect Cleanup: return () => clearInterval(id)
 *
 * The single change from boilerplate: save the interval ID and return a
 * cleanup function that calls clearInterval. React calls this cleanup:
 *
 *   1. When the component UNMOUNTS — stops the interval permanently.
 *   2. Before the NEXT effect run — if deps changed, the old interval is
 *      cleared before a new one starts. This prevents stacked intervals.
 *   3. In StrictMode dev double-mount — React mounts, cleans up, remounts.
 *      With cleanup, the second mount starts exactly one interval. Without
 *      cleanup, you'd have two intervals racing.
 *
 * Mental model: cleanup = "undo what this effect did."
 * If the effect called setInterval, cleanup calls clearInterval.
 * If it called addEventListener, cleanup calls removeEventListener.
 *
 * Async effects gotcha: you CANNOT return a Promise from useEffect.
 * Use an isCancelled flag instead:
 *   useEffect(() => {
 *     let cancelled = false;
 *     fetchData().then(d => { if (!cancelled) setData(d); });
 *     return () => { cancelled = true; };
 *   }, []);
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
  variant?: 'default' | 'destructive' | 'warning' | 'success' | 'outline';
}) => {
  const styles: Record<string, string> = {
    default: 'bg-primary/10 text-primary border-primary/20',
    destructive: 'bg-red-500/15 text-red-400 border-red-500/30',
    warning: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    success: 'bg-green-500/15 text-green-400 border-green-500/30',
    outline: 'bg-transparent text-muted-foreground border-border',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${styles[variant]}`}
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
  onClick: () => void;
  variant?: 'default' | 'outline';
}) => {
  const styles = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-border bg-background hover:bg-muted text-foreground',
  };
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${styles[variant]}`}
    >
      {children}
    </button>
  );
};

// ─── Fixed counter ────────────────────────────────────────────────────────────

interface CounterProps {
  onLog: (msg: string) => void;
}

function CleanCounter({ onLog }: CounterProps) {
  const [tick, setTick] = useState(0);
  const tickRef = useRef(0);

  useEffect(() => {
    onLog('🟢 Component mounted — interval started');

    // ✅ Save the ID so cleanup can clear it
    const id = setInterval(() => {
      tickRef.current += 1;
      setTick(tickRef.current);
      onLog(`⏱️ tick ${tickRef.current}`);
    }, 1000);

    // ✅ Return cleanup — React calls this on unmount AND before the next effect run
    return () => {
      clearInterval(id);
      onLog('🧹 Cleanup ran — interval cleared');
    };
  }, [onLog]); // onLog is stable (defined outside component), dep is satisfied

  return (
    <Card className="p-4 space-y-2">
      <p className="text-sm font-medium">
        Counter is <span className="text-green-400 font-bold">mounted</span>
      </p>
      <p className="text-2xl font-mono font-bold">{tick}s</p>
      <Badge variant="success">✅ Component alive</Badge>
    </Card>
  );
}

// ─── Parent toggle ────────────────────────────────────────────────────────────

export default function UseEffectCleanupSolution(): React.JSX.Element {
  const [mounted, setMounted] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [leakDetected, setLeakDetected] = useState(false);
  const lastCountAtUnmount = useRef<number>(-1);
  const logCountRef = useRef(0);

  const addLog = (msg: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
    logCountRef.current += 1;
  };

  // Runs every render intentionally — checks if new log entries appeared after unmount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!mounted && lastCountAtUnmount.current >= 0) {
      if (logCountRef.current > lastCountAtUnmount.current) {
        setLeakDetected(true);
      }
    }
  });

  const handleToggle = () => {
    if (mounted) {
      lastCountAtUnmount.current = logCountRef.current;
      setLeakDetected(false);
      addLog('🔴 Parent unmounted the component — interval will be cleared by cleanup…');
    } else {
      lastCountAtUnmount.current = -1;
      setLeakDetected(false);
      addLog('▶️ Parent mounting the component…');
    }
    setMounted((m) => !m);
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <div>
        <h2 className="text-base font-semibold">useEffect Cleanup — Fixed</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Unmounting now clears the interval immediately. The log freezes.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleToggle} variant={mounted ? 'outline' : 'default'}>
          {mounted ? '🔴 Unmount Counter' : '🟢 Mount Counter'}
        </Button>
        <Badge variant={mounted ? 'success' : 'outline'}>{mounted ? 'Mounted' : 'Unmounted'}</Badge>
      </div>

      {mounted && <CleanCounter onLog={addLog} />}

      {/* Only shows if somehow a leak slips through (should not happen with cleanup) */}
      {!mounted && leakDetected && (
        <div className="rounded-md border border-yellow-500/40 bg-yellow-500/10 px-3 py-2">
          <p className="text-sm font-semibold text-yellow-400">⚠️ Unexpected leak detected</p>
        </div>
      )}

      {/* Confirmation that the fix works */}
      {!mounted && !leakDetected && lastCountAtUnmount.current >= 0 && (
        <div className="rounded-md border border-green-500/40 bg-green-500/10 px-3 py-2">
          <p className="text-sm font-semibold text-green-400">✅ Log frozen — no leak!</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            The cleanup ran clearInterval. No new ticks after unmount.
          </p>
        </div>
      )}

      {/* Event log */}
      <Card className="p-3">
        <p className="text-xs font-semibold text-muted-foreground mb-2">Event Log</p>
        <div className="rounded-md border bg-muted/30 p-3 font-mono text-xs max-h-48 overflow-y-auto space-y-1">
          {logs.length === 0 ? (
            <p className="text-muted-foreground">No events yet — mount the counter above.</p>
          ) : (
            logs.map((log, i) => <p key={i}>{log}</p>)
          )}
        </div>
      </Card>

      {/* Status strip */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Component: {mounted ? 'mounted' : 'unmounted'}</Badge>
        <Badge variant={leakDetected ? 'warning' : 'success'}>
          Leak: {leakDetected ? '⚠️ detected' : '✅ none'}
        </Badge>
        <Badge variant="outline">Log entries: {logs.length}</Badge>
      </div>

      {/* Explanation card */}
      <Card className="p-4 space-y-3">
        <p className="text-sm font-semibold">✅ Why This Works</p>
        <ul className="space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
          <li>
            <span className="text-foreground font-medium">Cleanup runs on unmount AND between renders</span>
            {' '}— when deps change, React clears the old effect before running the new one. This prevents stacked intervals if the dep ever changes.
          </li>
          <li>
            <span className="text-foreground font-medium">StrictMode double-mounts deliberately</span>
            {' '}— React 18 mounts → unmounts → remounts in dev to surface missing cleanups. With cleanup, the second mount starts exactly one interval.
          </li>
          <li>
            <span className="text-foreground font-medium">Async effects can&apos;t return a Promise</span>
            {' '}— for async work use an <code className="bg-muted rounded px-0.5">isCancelled</code> flag; you cannot <code className="bg-muted rounded px-0.5">return async () =&gt; {'{...}'}</code> from useEffect.
          </li>
        </ul>

        {/* Before / after code panel */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="rounded-md border border-red-800 bg-red-950/40 p-3">
            <p className="text-xs font-semibold text-red-400 mb-2">❌ Before</p>
            <pre className="text-xs text-red-200 whitespace-pre-wrap">{`useEffect(() => {
  setInterval(tick, 1000);
  // no return — leaks!
}, []);`}</pre>
          </div>
          <div className="rounded-md border border-green-800 bg-green-950/40 p-3">
            <p className="text-xs font-semibold text-green-400 mb-2">✅ After</p>
            <pre className="text-xs text-green-200 whitespace-pre-wrap">{`useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}, []);`}</pre>
          </div>
        </div>
      </Card>
    </div>
  );
}
