'use client';

/**
 * ✅ SOLUTION — useRef as a bridge between renders and async callbacks
 *
 * The fix has two parts that work together:
 *
 * 1. `userRef` — a mutable container that persists across renders without
 *    causing re-renders when mutated. Unlike a closure variable, the ref
 *    object itself (its identity) never changes, so it can be captured once.
 *
 * 2. `useLayoutEffect` sync — runs synchronously before the browser paints
 *    on every render where `user` changes. This guarantees `userRef.current`
 *    always holds the latest prop, even before any async callback fires.
 *
 * The `handleSend` callback can now safely have empty deps because it no
 * longer reads from the closure — it reads from the stable ref. The closure
 * holds a reference to the *container* (userRef), not a *snapshot* of `user`.
 *
 * Why not just add `user` to useCallback's deps?
 *   That works too, but creates a new function reference on every user change.
 *   If `handleSend` is passed to a memoized child, this would bust the memo.
 *   The ref pattern gives you a stable identity AND always-fresh values.
 */

import { useCallback, useLayoutEffect, useRef, useState } from 'react';

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
  variant?: 'default' | 'success' | 'muted';
}) => {
  const cls =
    variant === 'success'
      ? 'bg-green-500/20 text-green-600 dark:text-green-400 border-transparent'
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

// ── ChatPanel — fixed with useRef ─────────────────────────────────────────────

function ChatPanel({ user }: ChatPanelProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  // ✅ Step 1: create the mutable container.
  // The ref object itself is created once and never changes identity —
  // this is what makes it safe to capture in a closure.
  const userRef = useRef(user);

  // ✅ Step 2: sync the ref on every render where `user` changes.
  // useLayoutEffect runs synchronously before the browser paints, so
  // userRef.current is always current before any async callback fires.
  useLayoutEffect(() => {
    userRef.current = user;
  }, [user]);

  // ✅ Safe with empty deps: the closure captures `userRef` (stable identity),
  // not `user` (a snapshot). Reading userRef.current at call time always yields
  // the latest prop, regardless of when the callback was created.
  const handleSend = useCallback(() => {
    const queuedAt = new Date().toLocaleTimeString();
    setLogs(prev =>
      [`[${queuedAt}] ⏳ Queued: will send in 3s…`, ...prev].slice(0, 50),
    );
    setPendingCount(c => c + 1);

    setTimeout(() => {
      // ✅ Reading from the ref — always the latest prop, never stale
      const currentUser = userRef.current;
      const sentAt = new Date().toLocaleTimeString();
      setLogs(prev =>
        [`[${sentAt}] 📨 "${currentUser}" sent a message`, ...prev].slice(0, 50),
      );
      setPendingCount(c => c - 1);
    }, 3000);
  }, []); // Safe: userRef is a stable object reference, not a closure snapshot

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">💬 Chat Panel</p>
        <Badge>prop user=&quot;{user}&quot;</Badge>
      </div>

      {/* No mismatch alert — the fix ensures there is never a mismatch */}
      <div className="rounded-md border border-green-700/30 bg-green-500/10 p-3 text-xs text-green-600 dark:text-green-400 leading-relaxed">
        ✅ <strong>Ref in sync.</strong> The setTimeout always reads the latest prop via{' '}
        <code className="rounded bg-green-900/20 px-1">userRef.current</code>. Switch users
        freely — the correct name will always appear.
      </div>

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
        <Badge variant="success">✅ No stale capture possible</Badge>
      </div>
    </Card>
  );
}

// ── Parent — same as boilerplate ──────────────────────────────────────────────

export default function CapturedPropsVsRefsSolution(): React.JSX.Element {
  const [activeUser, setActiveUser] = useState<'Alice' | 'Bob'>('Alice');

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">Captured Props vs Refs</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Switch to <strong>Bob</strong>, click Send — the log correctly shows Bob regardless of
          when the prop changed.
        </p>
      </div>

      {/* External user switcher */}
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

      {/* ── Explanation card ──────────────────────────────────────────────── */}
      <Card className="p-4 space-y-3">
        <p className="text-sm font-semibold">✅ Why This Works</p>
        <ul className="space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
          <li>
            Event handlers close over the value at <em>creation time</em> — not the latest render.
            A callback memoized with empty deps permanently holds the prop snapshot from mount.
          </li>
          <li>
            <code className="rounded bg-muted px-1">useRef</code> provides a mutable container
            whose identity is stable across renders. Capturing the ref object (not the value) means
            the closure can always read the freshest value via <code>.current</code>.
          </li>
          <li>
            Sync the ref inside{' '}
            <code className="rounded bg-muted px-1">useLayoutEffect</code> so it updates
            synchronously before paint — guaranteeing the latest value is available before any async
            callback fires.
          </li>
        </ul>

        {/* Before / after code panel */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="rounded-md border border-red-800 bg-red-950/40 p-3">
            <p className="text-xs font-semibold text-red-400 mb-2">❌ Before</p>
            <pre className="text-xs text-red-200 whitespace-pre-wrap">{`const handleSend = useCallback(() => {
  setTimeout(() => {
    // user is the stale closure value
    log(\`\${user} sent a message\`)
  }, 3000)
}, []) // missing \`user\` dep`}</pre>
          </div>
          <div className="rounded-md border border-green-800 bg-green-950/40 p-3">
            <p className="text-xs font-semibold text-green-400 mb-2">✅ After</p>
            <pre className="text-xs text-green-200 whitespace-pre-wrap">{`const userRef = useRef(user)
useLayoutEffect(() => {
  userRef.current = user
}, [user])

const handleSend = useCallback(() => {
  setTimeout(() => {
    // always reads the latest prop
    log(\`\${userRef.current} sent a message\`)
  }, 3000)
}, []) // safe — ref is stable`}</pre>
          </div>
        </div>
      </Card>
    </div>
  );
}
