'use client';

/**
 * 🚧 BOILERPLATE
 *
 * Implement `debounce` and `throttle` below. The "Run Tests" button will call them
 * with rapid sequences of invocations and log the result to the console panel.
 */

import { useState } from 'react';

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

  const handleDebounced = debounce(() => {
    console.log('debounced fire');
    setCount((c) => c + 1);
  }, 300);

  const handleThrottled = throttle(() => {
    console.log('throttled fire');
    setCount((c) => c + 1);
  }, 300);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Click each button rapidly. With correct implementations, debounced fires once
        after you stop, throttled fires at most every 300ms.
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
      </div>
      <p className="text-sm">Fires recorded: {count}</p>
    </div>
  );
}
