'use client';

/**
 * 🚧 BOILERPLATE
 *
 * A post card with a "❤️ Like" button. Right now it waits for the server
 * (1500ms) before updating the count — the button is disabled and the user
 * is stuck watching a spinner.
 *
 * Your goal: make the UI update IMMEDIATELY on click, then sync in the
 * background. If the server fails, roll back the count and show an error.
 *
 * Hints:
 *  - Snapshot `count` BEFORE you call setCount — you'll need it to roll back.
 *  - Move setCount ABOVE the await so the update is instant.
 *  - Wrap the API call in try/catch; restore the snapshot on error.
 *  - Remove the `disabled` on the button — optimistic UI stays responsive.
 */

import { useState } from 'react';
import { fakeLikePost } from './mock-api';

// ─── Inline UI primitives (Tailwind only, no shadcn imports) ─────────────────

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

export default function OptimisticUiRollbackBoilerplate(): React.JSX.Element {
  const [count, setCount] = useState(142);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logIdRef = { current: 0 };

  const addLog = (message: string, kind: LogEntry['kind']) => {
    logIdRef.current += 1;
    setLogs((prev) =>
      [{ id: logIdRef.current, time: new Date().toLocaleTimeString(), message, kind }, ...prev].slice(0, 30),
    );
  };

  // ❌ Naive implementation: waits for the server before updating the count.
  // The button is disabled for 1500ms on every click — no rapid liking allowed.
  const handleLike = async () => {
    if (loading) return;
    setLoading(true);
    addLog('⏳ Sending like request…', 'pending');

    try {
      // ❌ Server call FIRST — UI blocked until this resolves
      await fakeLikePost(false);
      setCount((c) => c + 1);
      addLog('✅ Server confirmed — count updated', 'success');
    } catch {
      addLog('❌ Request failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const logColors: Record<LogEntry['kind'], string> = {
    pending: 'text-muted-foreground',
    success: 'text-green-400',
    error: 'text-red-400',
  };

  return (
    <div className="space-y-4 max-w-sm mx-auto">
      <h2 className="text-base font-semibold">Optimistic UI — Naive Version</h2>
      <p className="text-xs text-muted-foreground">
        Click Like and notice the 1.5s freeze. You can&apos;t click again until the server responds.
      </p>

      {/* Post card */}
      <Card className="p-5 space-y-4">
        <div className="space-y-1">
          <p className="font-semibold text-sm">Building a Design System from Scratch</p>
          <p className="text-xs text-muted-foreground">
            A deep dive into tokens, component APIs, and the decisions that scale.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* ❌ Button disabled during the full 1500ms wait */}
          <button
            onClick={handleLike}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              '❤️'
            )}
            <span>{count.toLocaleString()}</span>
          </button>

          <Badge variant={loading ? 'warning' : 'outline'}>
            {loading ? '⏳ waiting for server…' : 'idle'}
          </Badge>
        </div>
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
        <Badge variant={loading ? 'warning' : 'outline'}>
          {loading ? '⏳ request in-flight' : '● idle'}
        </Badge>
      </div>
    </div>
  );
}
