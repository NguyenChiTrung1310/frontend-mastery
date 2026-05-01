'use client';

/**
 * ✅ SOLUTION
 *
 * Both implementations preserve `this` and forward args. The returned function
 * is widened to a `cancel`-aware shape so callers can clear pending timers
 * (useful in `useEffect` cleanup, for example).
 */

import { useState } from 'react';

type Cancellable<T extends (...args: never[]) => unknown> = T & { cancel: () => void };

function debounce<T extends (...args: never[]) => unknown>(
  fn: T,
  wait: number,
): Cancellable<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  function debounced(this: unknown, ...args: Parameters<T>): void {
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      fn.apply(this, args);
    }, wait);
  }

  debounced.cancel = (): void => {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
  };

  return debounced as Cancellable<T>;
}

/** Leading-edge throttle: fires immediately, then locks out for `wait` ms. */
function throttle<T extends (...args: never[]) => unknown>(
  fn: T,
  wait: number,
): Cancellable<T> {
  let lastCall = 0;
  let trailingTimer: ReturnType<typeof setTimeout> | undefined;

  function throttled(this: unknown, ...args: Parameters<T>): void {
    const now = Date.now();
    const remaining = wait - (now - lastCall);

    if (remaining <= 0) {
      lastCall = now;
      fn.apply(this, args);
    } else if (trailingTimer === undefined) {
      // Schedule a trailing call so the final invocation isn't lost
      trailingTimer = setTimeout(() => {
        lastCall = Date.now();
        trailingTimer = undefined;
        fn.apply(this, args);
      }, remaining);
    }
  }

  throttled.cancel = (): void => {
    if (trailingTimer !== undefined) {
      clearTimeout(trailingTimer);
      trailingTimer = undefined;
    }
    lastCall = 0;
  };

  return throttled as Cancellable<T>;
}

export default function DebounceThrottleSolution(): React.JSX.Element {
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
        Same UI as the boilerplate — but the implementations actually work.
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

      <div className="rounded-md border border-border bg-card p-4 space-y-3">
        <p className="text-sm font-semibold">✅ Why This Works</p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>Debounce resets the timer on every call — the function only fires after calls have stopped for <code className="rounded bg-muted px-1">wait</code> ms, collapsing a burst of calls into one.</li>
          <li>Throttle uses a leading-edge approach: fires immediately on first call, then locks out further calls for <code className="rounded bg-muted px-1">wait</code> ms — ensuring at most one fire per interval.</li>
          <li>Both use <code className="rounded bg-muted px-1">fn.apply(this, args)</code> to forward the calling context and arguments correctly to the wrapped function.</li>
        </ul>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-md border border-red-800 bg-red-950/40 p-3">
            <p className="text-xs font-semibold text-red-400 mb-2">❌ Before</p>
            <pre className="text-xs text-red-200 whitespace-pre-wrap">{`function debounce(fn, wait) {
  return fn; // stub — fires every call
}
function throttle(fn, wait) {
  return fn; // stub — fires every call
}`}</pre>
          </div>
          <div className="rounded-md border border-green-800 bg-green-950/40 p-3">
            <p className="text-xs font-semibold text-green-400 mb-2">✅ After</p>
            <pre className="text-xs text-green-200 whitespace-pre-wrap">{`function debounce(fn, wait) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
