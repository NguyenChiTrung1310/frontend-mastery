'use client';

/**
 * ✅ SOLUTION — Optimistic UI with snapshot-based rollback
 *
 * Three rules for correct optimistic updates:
 *
 *   1. Snapshot BEFORE mutating — `const prev = count` captured at call-site,
 *      before any setState. If you read count after setState the closure has
 *      already advanced and you lose the rollback value.
 *
 *   2. Update immediately, sync in background — setCount fires before the await.
 *      The button stays enabled; multiple in-flight likes are fine for a heart button.
 *
 *   3. Restore on failure — the catch block writes prev back to state.
 *      The UI snaps back and an error message surfaces. No silent stale state.
 *
 * When NOT to use optimistic UI:
 *   Destructive actions (delete, deactivate), financial transactions, and
 *   anything with irreversible side effects must confirm first — the rollback
 *   UX is jarring and a false confirmation causes real harm.
 *
 * Next step: React 19's useOptimistic() formalises this pattern inside
 * Server Actions — same mental model, less boilerplate.
 */

import { useRef, useState } from 'react';
import { fakeLikePost } from './mock-api';

// ─── Inline UI primitives (Tailwind only) ────────────────────────────────────

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
    {children}
  </div>
);

const Badge = ({
  children,
  variant = 'outline',
}: {
  children: React.ReactNode;
  variant?: 'outline' | 'success' | 'warning' | 'destructive';
}) => {
  const styles: Record<string, string> = {
    outline: 'bg-transparent text-muted-foreground border-border',
    success: 'bg-green-500/15 text-green-400 border-green-500/30',
    warning: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    destructive: 'bg-red-500/15 text-red-400 border-red-500/30',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface LogEntry {
  id: number;
  time: string;
  message: string;
  kind: 'pending' | 'success' | 'error';
}

// ─── Post card ────────────────────────────────────────────────────────────────

export default function OptimisticUiRollbackSolution(): React.JSX.Element {
  const [count, setCount] = useState(142);
  const [error, setError] = useState<string | null>(null);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  // Track in-flight requests — NOT used to disable the button
  const inFlightRef = useRef(0);
  const logIdRef = useRef(0);

  const addLog = (message: string, kind: LogEntry['kind']) => {
    logIdRef.current += 1;
    setLogs((prev) =>
      [{ id: logIdRef.current, time: new Date().toLocaleTimeString(), message, kind }, ...prev].slice(0, 30),
    );
  };

  const handleLike = async () => {
    // ✅ Step 1: Snapshot current count BEFORE any mutation.
    // This closure-captured value is what we restore on failure.
    const previousCount = count;

    // ✅ Step 2: Optimistic update — UI is instant, no disabled state needed.
    setCount((c) => c + 1);
    setError(null);
    inFlightRef.current += 1;
    addLog('⏳ Like sent optimistically — syncing with server…', 'pending');

    try {
      // Server call fires in the background. Button is already responsive again.
      await fakeLikePost(simulateFailure);
      addLog('✅ Synced — server confirmed', 'success');
    } catch (err) {
      // ✅ Step 3: Rollback — restore the snapshot taken before the mutation.
      setCount(previousCount);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(`❌ Failed — reverted. ${msg}`);
      addLog(`❌ Failed — reverted to ${previousCount}`, 'error');
    } finally {
      inFlightRef.current -= 1;
    }
  };

  const logColors: Record<LogEntry['kind'], string> = {
    pending: 'text-muted-foreground',
    success: 'text-green-400',
    error: 'text-red-400',
  };

  const inFlight = inFlightRef.current > 0;

  return (
    <div className="space-y-4 max-w-sm mx-auto">
      <h2 className="text-base font-semibold">Optimistic UI — Fixed</h2>
      <p className="text-xs text-muted-foreground">
        Click Like — count updates instantly. Toggle failure to watch the rollback.
      </p>

      {/* Failure toggle */}
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={simulateFailure}
          onChange={(e) => setSimulateFailure(e.target.checked)}
          className="h-3.5 w-3.5 rounded border border-border accent-primary"
        />
        <span className="text-xs text-muted-foreground">
          🎲 Simulate failure (next like will fail &amp; roll back)
        </span>
      </label>

      {/* Post card */}
      <Card className="p-5 space-y-4">
        <div className="space-y-1">
          <p className="font-semibold text-sm">Building a Design System from Scratch</p>
          <p className="text-xs text-muted-foreground">
            A deep dive into tokens, component APIs, and the decisions that scale.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* ✅ Button is NEVER disabled — optimistic UI stays responsive */}
          <button
            onClick={handleLike}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            ❤️ <span>{count.toLocaleString()}</span>
          </button>

          <Badge variant={inFlight ? 'warning' : 'success'}>
            {inFlight ? `⏳ ${inFlightRef.current} in-flight` : '✅ all synced'}
          </Badge>
        </div>

        {/* Error / rollback alert */}
        {error && (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2">
            <p className="text-xs font-medium text-red-400">{error}</p>
          </div>
        )}
      </Card>

      {/* Request log */}
      <Card className="p-3">
        <p className="text-xs font-semibold text-muted-foreground mb-2">Request Log</p>
        <div className="rounded-md border bg-muted/30 p-3 font-mono text-xs max-h-48 overflow-y-auto space-y-1">
          {logs.length === 0 ? (
            <p className="text-muted-foreground">No requests yet — click Like above.</p>
          ) : (
            logs.map((log) => (
              <p key={log.id} className={logColors[log.kind]}>
                [{log.time}] {log.message}
              </p>
            ))
          )}
        </div>
      </Card>

      {/* Status strip */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">likes: {count}</Badge>
        <Badge variant={simulateFailure ? 'destructive' : 'outline'}>
          {simulateFailure ? '🎲 failure mode ON' : 'failure mode off'}
        </Badge>
        <Badge variant={inFlight ? 'warning' : 'outline'}>
          {inFlight ? `⏳ ${inFlightRef.current} syncing` : '● idle'}
        </Badge>
      </div>

      {/* Explanation card */}
      <Card className="p-4 space-y-3">
        <p className="text-sm font-semibold">✅ Why This Works</p>
        <ul className="space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
          <li>
            <span className="text-foreground font-medium">Snapshot state before mutation — rollback restores the snapshot</span>
            {' '}— <code className="bg-muted rounded px-0.5">const prev = count</code> is captured before any <code className="bg-muted rounded px-0.5">setState</code> call. After an async gap the closure value is stale; the snapshot is not.
          </li>
          <li>
            <span className="text-foreground font-medium">Button stays enabled — queue multiple likes, all eventually sync</span>
            {' '}— each click captures its own snapshot. Concurrent in-flight requests roll back independently on failure.
          </li>
          <li>
            <span className="text-foreground font-medium">Do NOT use for destructive actions (delete, payment) — confirm first</span>
            {' '}— rolling back a deletion is confusing; rolling back a payment is dangerous. Optimistic UI is for low-stakes, reversible interactions.
          </li>
        </ul>

        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="rounded-md border border-red-800 bg-red-950/40 p-3">
            <p className="text-xs font-semibold text-red-400 mb-2">❌ Before</p>
            <pre className="text-xs text-red-200 whitespace-pre-wrap">{`// Blocks UI for 1500ms
await api.like(id);
setCount(c + 1);`}</pre>
          </div>
          <div className="rounded-md border border-green-800 bg-green-950/40 p-3">
            <p className="text-xs font-semibold text-green-400 mb-2">✅ After</p>
            <pre className="text-xs text-green-200 whitespace-pre-wrap">{`const prev = count;
setCount(c + 1); // instant
try {
  await api.like(id);
} catch {
  setCount(prev); // rollback
}`}</pre>
          </div>
        </div>
      </Card>
    </div>
  );
}
