'use client';

/**
 * ✅ SOLUTION — useCallback + React.memo: the mandatory pair
 *
 * The single change that fixes everything:
 *
 *   const handleClick = useCallback((id: number) => {
 *     setSelected(id);
 *   }, []);
 *
 * useCallback returns the SAME function object across renders. React.memo's
 * shallow prop comparison now sees `prevOnClick === nextOnClick` → true →
 * the Row is skipped entirely.
 *
 * Two things taught in this file:
 *
 * 1. ✅ CORRECT: useCallback + React.memo = Rows skip re-renders on unrelated
 *    parent state changes.
 *
 * 2. ❌ WRONG: useCallback WITHOUT React.memo = still re-renders. The stable
 *    function reference is there, but nothing reads it — there's no memo guard
 *    to stop the child from rendering when the parent does.
 *
 * The "Wrong Pattern" demo is in a self-contained sub-component so its state
 * changes don't affect the memoized Rows in the correct demo above it.
 */

import React, { useState, useRef, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Inline UI primitives — Tailwind only, same shape as boilerplate
// ---------------------------------------------------------------------------
const Badge = ({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'red' | 'green' | 'amber' | 'muted';
}) => {
  const colors: Record<string, string> = {
    default: 'bg-muted text-muted-foreground',
    red: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300',
    green: 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
    muted: 'bg-muted/50 text-muted-foreground',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[variant] ?? colors['default']}`}
    >
      {children}
    </span>
  );
};

// ---------------------------------------------------------------------------
// ✅ Row — React.memo + stable onClick via useCallback → skips wasted renders
// ---------------------------------------------------------------------------
interface RowProps {
  id: number;
  label: string;
  onClick: (id: number) => void;
}

const Row = React.memo(function Row({ id, label, onClick }: RowProps) {
  const renderCount = useRef(0);
  renderCount.current += 1;

  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-2">
        {/* Stays green at "renders: 1" when useCallback + memo are both applied */}
        <span
          className={`font-mono text-xs ${
            renderCount.current > 1
              ? 'font-bold text-red-500 dark:text-red-400'
              : 'text-green-600 dark:text-green-400'
          }`}
        >
          renders: {renderCount.current}
        </span>
        <button
          onClick={() => onClick(id)}
          className="rounded px-2 py-0.5 text-xs bg-muted transition-colors hover:bg-muted/80"
        >
          Select
        </button>
      </div>
    </div>
  );
});
Row.displayName = 'Row';

// ---------------------------------------------------------------------------
// ❌ UnmemoizedRow — NOT wrapped in React.memo
// Without memo, React always re-renders children when the parent re-renders,
// regardless of whether props changed. useCallback in the parent is wasted.
// ---------------------------------------------------------------------------
function UnmemoizedRow({ id: _id, label }: { id: number; label: string }) {
  const renderCount = useRef(0);
  renderCount.current += 1;

  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-mono text-xs font-bold text-red-500 dark:text-red-400">
        renders: {renderCount.current}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stable data — defined outside components, never recreated
// ---------------------------------------------------------------------------
const ITEMS = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  label: `Row item #${i + 1}`,
})) satisfies Array<{ id: number; label: string }>;

const WRONG_ITEMS = Array.from({ length: 4 }, (_, i) => ({
  id: i + 1,
  label: `No-memo Row #${i + 1}`,
})) satisfies Array<{ id: number; label: string }>;

// ---------------------------------------------------------------------------
// ❌ Wrong Pattern sub-component (isolated state — doesn't affect Row above)
// ---------------------------------------------------------------------------
function WrongPatternDemo(): React.JSX.Element {
  const [count, setCount] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  // ✅ useCallback is applied — function reference is stable
  // But it doesn't matter: without React.memo on UnmemoizedRow, the rows
  // re-render every time this parent re-renders. The stable reference is unused.
  const handleClick = useCallback((_id: number) => {
    // Handler is stable — but UnmemoizedRow ignores onClick entirely,
    // and even if it used it, re-renders are driven by the parent render, not props.
  }, []);
  void handleClick; // intentionally unused in UnmemoizedRow — illustrates the point

  const handleIncrement = () => {
    const time = new Date().toLocaleTimeString();
    setCount(c => c + 1);
    setLogs(prev =>
      [
        `[${time}] 🔵 Parent re-rendered`,
        // UnmemoizedRow re-renders because the parent did — not because props changed
        ...WRONG_ITEMS.map(
          item => `[${time}] 🔴 UnmemoizedRow ${item.id} re-rendered (no memo)`,
        ),
        ...prev,
      ].slice(0, 50),
    );
  };

  return (
    <div className="rounded-md border border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            ⚠️ Wrong pattern: useCallback without React.memo
          </h3>
          <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
            The handler is stable — but with no memo guard, rows re-render anyway.
          </p>
        </div>
        <Badge variant="amber">Counter: {count}</Badge>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleIncrement}
          className="rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-amber-700"
        >
          Increment (wrong)
        </button>
        <button
          onClick={() => setLogs([])}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
        >
          Clear
        </button>
      </div>

      <div className="space-y-1.5">
        {WRONG_ITEMS.map(item => (
          <UnmemoizedRow key={item.id} id={item.id} label={item.label} />
        ))}
      </div>

      <div className="max-h-32 overflow-y-auto rounded-md border bg-muted/30 p-3 font-mono text-xs space-y-0.5">
        {logs.length === 0 ? (
          <p className="text-muted-foreground">
            Click &ldquo;Increment (wrong)&rdquo; — rows re-render even with useCallback…
          </p>
        ) : (
          logs.map((log, i) => (
            <p
              key={i}
              className={
                log.includes('UnmemoizedRow')
                  ? 'text-red-500 dark:text-red-400'
                  : 'text-blue-600 dark:text-blue-400'
              }
            >
              {log}
            </p>
          ))
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main solution component
// ---------------------------------------------------------------------------
export default function UsecallbackReferentialStabilitySolution(): React.JSX.Element {
  const [count, setCount] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  // ✅ useCallback with [] — the same function object is returned on every render.
  // React.memo on Row receives the same reference → prop comparison passes →
  // Row is skipped. Empty deps is correct: setSelected is guaranteed stable by React.
  const handleClick = useCallback((id: number) => {
    setSelected(id);
  }, []);

  const handleIncrement = () => {
    const time = new Date().toLocaleTimeString();
    setCount(c => c + 1);
    // Only ONE log entry — no Rows re-rendered!
    setLogs(prev =>
      [
        `[${time}] 🔵 Parent re-rendered — Rows skipped (useCallback + memo) ✅`,
        ...prev,
      ].slice(0, 50),
    );
  };

  return (
    <div className="space-y-6">
      {/* ✅ CORRECT PANEL */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold">
              ✅ Correct: useCallback + React.memo
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Incrementing the counter no longer re-renders any Row.
            </p>
          </div>
          <Badge variant="green">Wasted renders: 0</Badge>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleIncrement}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Increment counter
          </button>
          <button
            onClick={() => setLogs([])}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            Clear log
          </button>
          <span className="text-sm text-muted-foreground">Counter: {count}</span>
          {selected !== null && (
            <span className="text-sm text-muted-foreground">Selected: Row {selected}</span>
          )}
        </div>

        <div className="space-y-1.5">
          {ITEMS.map(item => (
            // ✅ handleClick is stable — Row memo check passes every time
            <Row key={item.id} id={item.id} label={item.label} onClick={handleClick} />
          ))}
        </div>

        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground">Render log</p>
          <div className="max-h-36 overflow-y-auto rounded-md border bg-muted/30 p-3 font-mono text-xs space-y-0.5">
            {logs.length === 0 ? (
              <p className="text-muted-foreground">
                Click &ldquo;Increment counter&rdquo; — only the parent entry appears.
              </p>
            ) : (
              logs.map((log, i) => (
                <p key={i} className="text-blue-600 dark:text-blue-400">
                  {log}
                </p>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge>Counter: {count}</Badge>
          <Badge variant="green">Wasted renders: 0</Badge>
          <Badge variant="muted">Rows: {ITEMS.length} (React.memo&apos;d)</Badge>
        </div>
      </div>

      {/* ❌ WRONG PATTERN PANEL — isolated sub-component with its own state */}
      <WrongPatternDemo />

      {/* EXPLANATION CARD */}
      <div className="rounded-md border border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-950/20 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-green-800 dark:text-green-300">
          ✅ Why This Works
        </h3>
        <ul className="space-y-2 text-xs text-green-800 dark:text-green-300">
          <li>
            <strong>React.memo does shallow prop comparison — functions fail by reference.</strong>{' '}
            Two inline <code className="rounded bg-black/10 dark:bg-white/10 px-1">{'() => {}'}</code>{' '}
            are never <code className="rounded bg-black/10 dark:bg-white/10 px-1">===</code> equal,
            even if they look identical. React.memo always re-renders when it sees a new
            function reference.
          </li>
          <li>
            <strong>useCallback memoizes the reference</strong> — the same function object is
            returned every render, so React.memo&apos;s{' '}
            <code className="rounded bg-black/10 dark:bg-white/10 px-1">Object.is</code> check
            passes and the child is skipped.
          </li>
          <li>
            <strong>Prerequisite: the child must be React.memo&apos;d.</strong> useCallback alone
            does nothing. The wrong-panel above proves it: the handler is stable, but rows
            re-render anyway because there is no memo guard to stop them when the parent renders.
          </li>
        </ul>

        {/* Before / after code panel */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="rounded-md border border-red-800 bg-red-950/40 p-3">
            <p className="mb-2 text-xs font-semibold text-red-400">❌ Before</p>
            <pre className="whitespace-pre-wrap text-xs text-red-200">{`// New object every render
const handleClick = (id: number) => {
  setSelected(id);
};

<Row onClick={handleClick} />`}</pre>
          </div>
          <div className="rounded-md border border-green-800 bg-green-950/40 p-3">
            <p className="mb-2 text-xs font-semibold text-green-400">✅ After</p>
            <pre className="whitespace-pre-wrap text-xs text-green-200">{`// Same reference across renders
const handleClick = useCallback(
  (id: number) => { setSelected(id); },
  [] // setSelected is stable — no deps needed
);

<Row onClick={handleClick} />`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
