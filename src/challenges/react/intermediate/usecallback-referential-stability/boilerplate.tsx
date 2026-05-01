'use client';

/**
 * 🚧 BOILERPLATE
 *
 * A parent has an unrelated counter and 8 child Row components, each wrapped
 * in React.memo. An inline onClick handler is passed to every Row as a prop.
 *
 * Click "Increment" and watch the render log:
 *   🔴 Parent re-rendered
 *   🔴 Row 1 re-rendered  ← all 8 fire, every time
 *   🔴 Row 2 re-rendered
 *   ... (8 entries)
 *
 * React.memo is not helping. Each Row's render count badge climbs with every
 * click even though the list data never changed.
 *
 * Hints:
 *  - Why does `(id: number) => setSelected(id)` produce a new object each render?
 *  - What does React.memo compare when deciding whether to skip a render?
 *  - Which hook returns the SAME function reference across renders?
 *  - What goes in the dependency array — and why can it be empty here?
 */

import React, { useState, useRef } from 'react';

// ---------------------------------------------------------------------------
// Inline UI primitives — self-contained, Tailwind only
// ---------------------------------------------------------------------------
const Badge = ({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'red' | 'muted';
}) => {
  const colors: Record<string, string> = {
    default: 'bg-muted text-muted-foreground',
    red: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300',
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
// Row — wrapped in React.memo, but memo is defeated by the inline onClick prop
// ---------------------------------------------------------------------------
interface RowProps {
  id: number;
  label: string;
  onClick: (id: number) => void;
}

const Row = React.memo(function Row({ id, label, onClick }: RowProps) {
  // Mutating a ref during render is safe — does not trigger re-renders.
  // Because Row IS re-rendering (memo check failed), this counter increments
  // and its updated value is visible immediately in the same render output.
  const renderCount = useRef(0);
  renderCount.current += 1;

  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-2">
        {/* Turns red the moment the Row renders more than once */}
        <span
          className={`font-mono text-xs ${
            renderCount.current > 1
              ? 'font-bold text-red-500 dark:text-red-400'
              : 'text-muted-foreground'
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
// Stable list data — defined outside the component, never recreated
// ---------------------------------------------------------------------------
const ITEMS = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  label: `Row item #${i + 1}`,
})) satisfies Array<{ id: number; label: string }>;

// ---------------------------------------------------------------------------
// Parent component
// ---------------------------------------------------------------------------
export default function UsecallbackReferentialStabilityBoilerplate(): React.JSX.Element {
  const [count, setCount] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [wastedRenders, setWastedRenders] = useState(0);

  const handleIncrement = () => {
    const time = new Date().toLocaleTimeString();
    setCount(c => c + 1);
    // All 8 Rows re-render because onClick is a new function on every parent render.
    // React.memo's shallow comparison sees a different function reference → re-renders.
    setWastedRenders(w => w + ITEMS.length);
    setLogs(prev =>
      [
        `[${time}] 🔴 Parent re-rendered`,
        // Rows re-render synchronously as part of the same render pass
        ...ITEMS.map(item => `[${time}] 🔴 Row ${item.id} re-rendered`),
        ...prev,
      ].slice(0, 80),
    );
  };

  // ❌ TODO: This inline handler is a brand-new function object on every render.
  // React.memo uses Object.is() to compare props — two different function objects
  // are never equal, so memo's prop check always fails.
  //
  // Fix: wrap this in useCallback with the correct dependency array.
  const handleClick = (id: number) => {
    setSelected(id);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold">useCallback & Referential Stability</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            8 Rows wrapped in <code className="rounded bg-muted px-1">React.memo</code> — but
            the inline handler defeats it silently.
          </p>
        </div>
        <Badge variant="red">Wasted renders: {wastedRenders}</Badge>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleIncrement}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Increment counter
        </button>
        <button
          onClick={() => {
            setLogs([]);
            setWastedRenders(0);
          }}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
        >
          Clear log
        </button>
        <span className="text-sm text-muted-foreground">Counter: {count}</span>
        {selected !== null && (
          <span className="text-sm text-muted-foreground">Selected: Row {selected}</span>
        )}
      </div>

      {/* Row list */}
      <div className="space-y-1.5">
        {ITEMS.map(item => (
          <Row
            key={item.id}
            id={item.id}
            label={item.label}
            // ❌ New function reference on every render — memo check always fails
            onClick={handleClick}
          />
        ))}
      </div>

      {/* Render log */}
      <div>
        <p className="mb-1 text-xs font-medium text-muted-foreground">Render log</p>
        <div className="max-h-48 overflow-y-auto rounded-md border bg-muted/30 p-3 font-mono text-xs space-y-0.5">
          {logs.length === 0 ? (
            <p className="text-muted-foreground">
              Click &ldquo;Increment counter&rdquo; to see the wasted renders…
            </p>
          ) : (
            logs.map((log, i) => (
              <p
                key={i}
                className={
                  log.includes('Row')
                    ? 'text-red-500 dark:text-red-400'
                    : 'text-yellow-600 dark:text-yellow-400'
                }
              >
                {log}
              </p>
            ))
          )}
        </div>
      </div>

      {/* Status strip */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge>Counter: {count}</Badge>
        <Badge variant="red">Wasted renders: {wastedRenders}</Badge>
        <Badge variant="muted">Rows: {ITEMS.length} (all React.memo&apos;d)</Badge>
      </div>
    </div>
  );
}
