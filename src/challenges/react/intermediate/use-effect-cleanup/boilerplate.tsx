'use client';

/**
 * 🚧 BOILERPLATE
 *
 * The LeakyCounter below starts a setInterval on mount and increments a tick
 * counter every second. A parent toggle mounts/unmounts it.
 *
 * Bug: when you unmount the component, the interval keeps running — you can
 * see new entries appearing in the log even after the component is gone.
 * The "⚠️ Leak Active" badge lights up to confirm the leak.
 *
 * Hints:
 *  - useEffect must return a cleanup function to undo what it set up.
 *  - Save the return value of setInterval — you'll need it in the cleanup.
 *  - The cleanup signature is: return () => clearInterval(id);
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

// ─── Leaky counter (the component to fix) ────────────────────────────────────

interface LeakyCounterProps {
  onLog: (msg: string) => void;
}

function LeakyCounter({ onLog }: LeakyCounterProps) {
  const [tick, setTick] = useState(0);
  const tickRef = useRef(0);

  // ❌ TODO: this effect leaks — the interval is never cleared on unmount.
  // Fix it by returning a cleanup function: return () => clearInterval(id);
  useEffect(() => {
    onLog('🟢 Component mounted — interval started');

    setInterval(() => {
      tickRef.current += 1;
      setTick(tickRef.current);
      onLog(`⏱️ tick ${tickRef.current}`);
    }, 1000);

    // ❌ Missing: return () => clearInterval(id);
  }, [onLog]);

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

export default function UseEffectCleanupBoilerplate(): React.JSX.Element {
  const [mounted, setMounted] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [leakDetected, setLeakDetected] = useState(false);
  const lastCountAtUnmount = useRef<number>(-1);
  const logCountRef = useRef(0);

  const addLog = (msg: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
    logCountRef.current += 1;
  };

  // Detect leak: runs every render intentionally — checks if new log entries appeared after unmount
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
      // Record log count at unmount time so we can detect new entries afterward
      lastCountAtUnmount.current = logCountRef.current;
      setLeakDetected(false);
      addLog('🔴 Parent unmounted the component — interval should stop…');
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
        <h2 className="text-base font-semibold">useEffect Cleanup — Memory Leak Demo</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Mount the counter, wait a few ticks, then unmount it. The log should freeze — but it won&apos;t.
        </p>
      </div>

      {/* Mount / Unmount control */}
      <div className="flex items-center gap-3">
        <Button onClick={handleToggle} variant={mounted ? 'outline' : 'default'}>
          {mounted ? '🔴 Unmount Counter' : '🟢 Mount Counter'}
        </Button>
        <Badge variant={mounted ? 'success' : 'outline'}>{mounted ? 'Mounted' : 'Unmounted'}</Badge>
      </div>

      {/* The leaky component */}
      {mounted && <LeakyCounter onLog={addLog} />}

      {/* Leak indicator */}
      {!mounted && leakDetected && (
        <div className="rounded-md border border-yellow-500/40 bg-yellow-500/10 px-3 py-2">
          <p className="text-sm font-semibold text-yellow-400">
            ⚠️ Leak Active — still ticking!
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            New log entries are appearing after unmount. The interval was never cleared.
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
        <Badge variant={leakDetected ? 'warning' : 'outline'}>
          Leak: {leakDetected ? '⚠️ detected' : 'none'}
        </Badge>
        <Badge variant="outline">Log entries: {logs.length}</Badge>
      </div>
    </div>
  );
}
