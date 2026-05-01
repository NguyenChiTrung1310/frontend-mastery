'use client';

/**
 * 🚧 BOILERPLATE
 *
 * Implement `debounce` and `throttle` below. The "Run Tests" button will call them
 * with rapid sequences of invocations and log the result to the console panel.
 */

import { useRef, useState } from 'react';

// ❌ TODO: implement properly
function debounce<T extends (...args: never[]) => unknown>(fn: T, _wait: number): T {
  return fn; // <- replace this stub
}

// ❌ TODO: implement properly
function throttle<T extends (...args: never[]) => unknown>(fn: T, _wait: number): T {
  return fn; // <- replace this stub
}

export default function DebounceThrottleBoilerplate(): React.JSX.Element {
  const [count, setCount] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const addLog = (msg: string): void =>
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));

  // Recreate handlers on every render — with the stubs above, both fire on every click.
  // With correct implementations: debounced fires once after clicking stops,
  // throttled fires at most once per 300ms.
  const handleDebounced = debounce(() => {
    addLog('🔵 debounce fired — should only happen once after rapid clicks stop');
    setCount((c) => c + 1);
  }, 300);

  // useRef would be needed to persist across renders in a real implementation,
  // but for observing the stub behaviour this is intentional.
  const throttleCallCount = useRef(0);
  const handleThrottled = throttle(() => {
    throttleCallCount.current += 1;
    addLog(`🟠 throttle fired (#${throttleCallCount.current}) — should fire at most every 300ms`);
    setCount((c) => c + 1);
  }, 300);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Click each button <strong>rapidly</strong>. The stubs fire on every click — the log
        below makes this obvious. With correct implementations, debounced fires once after you
        stop; throttled fires at most every 300ms.
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleDebounced}
          className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
        >
          Click (debounced)
        </button>
        <button
          onClick={handleThrottled}
          className="rounded-md bg-secondary px-3 py-2 text-sm text-secondary-foreground"
        >
          Click (throttled)
        </button>
        <button
          onClick={() => { setLogs([]); setCount(0); throttleCallCount.current = 0; }}
          className="rounded-md border px-3 py-2 text-sm hover:bg-accent"
        >
          Clear
        </button>
      </div>
      <p className="text-sm">Total fires: <strong>{count}</strong></p>

      {/* ⚠️ With the stubs, every click shows an entry — that's the bug made visible */}
      <div className="rounded-md border bg-muted/30 p-3 font-mono text-xs max-h-48 overflow-y-auto space-y-1">
        {logs.length === 0
          ? <p className="text-muted-foreground">No events yet — click the buttons above…</p>
          : logs.map((log, i) => <p key={i}>{log}</p>)
        }
      </div>
      <p className="text-xs text-muted-foreground">
        ⚠️ With the broken stubs, the log fills up with every click.
        Fix <code className="rounded bg-muted px-1">debounce</code> and <code className="rounded bg-muted px-1">throttle</code> above to see the log thin out.
      </p>
    </div>
  );
}
