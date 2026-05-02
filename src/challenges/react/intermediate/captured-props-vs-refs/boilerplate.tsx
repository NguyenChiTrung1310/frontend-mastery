'use client';

/**
 * 🚧 BOILERPLATE
 *
 * ChatPanel receives a `user` prop toggled by the parent. It has a
 * "Send delayed message in 3s" button that fires a setTimeout.
 *
 * Try this:
 *   1. Switch the active user from Alice → Bob
 *   2. Immediately click "Send delayed message in 3s"
 *   3. Wait 3 seconds — whose name appears in the log?
 *
 * Hints:
 *  - handleSend is memoized with useCallback. Check its dependency array.
 *  - When a callback has empty deps, `user` is frozen to the value present
 *    at mount — it never refreshes when the prop changes.
 *  - Fix: create a useRef that's kept in sync with the `user` prop, then
 *    read ref.current inside the setTimeout instead of the stale variable.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

// ── Inline UI primitives (Tailwind only) ─────────────────────────────────────

const Card = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`rounded-lg border bg-card text-card-foreground ${className}`}>{children}</div>
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
      ? 'bg-destructive/20 text-destructive border-destructive/30'
      : variant === 'muted'
        ? 'bg-muted text-muted-foreground border-transparent'
        : 'bg-secondary text-secondary-foreground border-transparent';
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}
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

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChatPanelProps {
  user: 'Alice' | 'Bob';
}

// ── ChatPanel — has the stale closure bug ─────────────────────────────────────

function ChatPanel({ user }: ChatPanelProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [mismatch, setMismatch] = useState<{ expected: string; got: string } | null>(null);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔭 DETECTION SCAFFOLDING — for the mismatch alert only, not the fix.
  // This ref tells the setTimeout what the prop is NOW so the alert can
  // show the discrepancy. Your task is to apply this same pattern to make
  // the message text correct, not just the detection.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const latestUserForDetection = useRef(user);
  useEffect(() => {
    latestUserForDetection.current = user;
  }, [user]);

  // ❌ TODO: the setTimeout below reads `capturedUser`, which is stale.
  //   - Create a userRef = useRef(user) and sync it via useLayoutEffect.
  //   - Replace `capturedUser` in the log line with userRef.current.
  const handleSend = useCallback(() => {
    const capturedUser = user; // ← frozen at creation time — goes stale when prop changes
    const queuedAt = new Date().toLocaleTimeString();
    setLogs(prev =>
      [`[${queuedAt}] ⏳ Queued: "${capturedUser}" will send in 3s…`, ...prev].slice(0, 50),
    );
    setPendingCount(c => c + 1);

    setTimeout(() => {
      const actualUser = latestUserForDetection.current;
      const sentAt = new Date().toLocaleTimeString();

      // ❌ capturedUser is stale — it reflects the prop value at mount, not now
      setLogs(prev =>
        [`[${sentAt}] 📨 "${capturedUser}" sent a message`, ...prev].slice(0, 50),
      );
      setPendingCount(c => c - 1);

      if (capturedUser !== actualUser) {
        setMismatch({ expected: actualUser, got: capturedUser });
        setLogs(prev =>
          [
            `[${sentAt}] ⚠️ Mismatch! Expected "${actualUser}", got "${capturedUser}"`,
            ...prev,
          ].slice(0, 50),
        );
      }
    }, 3000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ← intentionally empty to surface the stale closure bug

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">💬 Chat Panel</p>
        <Badge>prop user=&quot;{user}&quot;</Badge>
      </div>

      {mismatch !== null && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive leading-relaxed">
          🕰️ <strong>Stale prop captured!</strong> Expected:{' '}
          <strong>&quot;{mismatch.expected}&quot;</strong>, Got:{' '}
          <strong>&quot;{mismatch.got}&quot;</strong>
          <br />
          The setTimeout ran with an old closure — it never saw the updated prop.
        </div>
      )}

      <Button onClick={handleSend}>Send delayed message in 3s</Button>

      {/* Timestamped event log */}
      <div className="rounded-md border bg-muted/30 p-3 font-mono text-xs max-h-48 overflow-y-auto space-y-1">
        {logs.length === 0 ? (
          <p className="text-muted-foreground">No events yet…</p>
        ) : (
          logs.map((log, i) => <p key={i}>{log}</p>)
        )}
      </div>

      {/* Status badge strip */}
      <div className="flex flex-wrap gap-2 pt-2 border-t">
        <Badge>Current prop: &quot;{user}&quot;</Badge>
        <Badge variant={pendingCount > 0 ? 'default' : 'muted'}>⏳ Pending: {pendingCount}</Badge>
        <Badge variant={mismatch !== null ? 'destructive' : 'muted'}>
          {mismatch !== null ? '⚠️ Stale capture detected' : '✓ No mismatch yet'}
        </Badge>
      </div>
    </Card>
  );
}

// ── Parent — toggles the user prop externally ─────────────────────────────────

export default function CapturedPropsVsRefsBoilerplate(): React.JSX.Element {
  const [activeUser, setActiveUser] = useState<'Alice' | 'Bob'>('Alice');

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">Captured Props vs Refs</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Switch to <strong>Bob</strong>, then immediately click{' '}
          <em>Send delayed message in 3s</em>. What name appears in the log?
        </p>
      </div>

      {/* External user switcher — simulates the prop changing from outside */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Active user:</span>
        <div className="flex gap-2">
          {(['Alice', 'Bob'] as const).map(name => (
            <Button
              key={name}
              variant={activeUser === name ? 'default' : 'outline'}
              onClick={() => setActiveUser(name)}
            >
              {name}
            </Button>
          ))}
        </div>
      </div>

      <ChatPanel user={activeUser} />
    </div>
  );
}
