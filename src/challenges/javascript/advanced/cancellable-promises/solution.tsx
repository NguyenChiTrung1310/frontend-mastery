'use client';

/**
 * ✅ SOLUTION — AbortController for cancellable async work
 *
 * Three things compose correctly here:
 *
 *  1. **AbortController in useEffect** — each run of the effect creates a fresh
 *     controller. The cleanup function calls `controller.abort()`. This fires
 *     when the component unmounts OR when the effect re-runs (dependency change).
 *     No leaked async work, no "setState on unmounted component" warnings.
 *
 *  2. **signal passed through** — `heavyComputation` accepts `signal` and calls
 *     `signal.throwIfAborted()` between steps. When `abort()` fires, the next
 *     check throws `DOMException('Aborted', 'AbortError')`. The computation stops
 *     at the current step boundary — not mid-step, but before the next one.
 *
 *  3. **AbortError guard in catch** — cancellation is not a bug. We catch it
 *     separately and return early (no UI update). Only real errors reach `setError`.
 *
 * `controllerRef` vs creating a new controller in useEffect:
 *   We store the controller in a ref so the "Cancel" button handler can call
 *   `controller.abort()` without needing it in the component's state (which
 *   would cause an extra render). The ref is stable across renders.
 *
 * Why not `useCallback` on `start`?
 *   `start` recreates the controller on every call, so it can't be memoized
 *   without resetting the ref — adding complexity for no benefit here. If
 *   `start` were passed as a prop to children, memoize it.
 */

import { useEffect, useRef, useState } from 'react';
import { heavyComputation, type ComputationProgress } from './mock-api';

export default function CancellablePromisesSolution(): React.JSX.Element {
  const [progress, setProgress] = useState<ComputationProgress | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  // Stable ref so the Cancel button handler always has access to the current controller.
  const controllerRef = useRef<AbortController | null>(null);

  const start = (): void => {
    // Cancel any previously running computation before starting a new one.
    controllerRef.current?.abort();

    const controller = new AbortController();
    controllerRef.current = controller;

    setProgress(null);
    setResult(null);
    setError(null);
    setRunning(true);

    void heavyComputation(controller.signal, setProgress)
      .then((r) => {
        setResult(r);
        setRunning(false);
      })
      .catch((err: unknown) => {
        // AbortError = user cancelled or component unmounted. Not a real failure.
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : String(err));
        setRunning(false);
      });
  };

  useEffect(() => {
    start();
    // Cleanup: abort if the component unmounts while computation is in flight.
    return () => controllerRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pct = progress ? Math.round((progress.step / progress.total) * 100) : 0;

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">Cancellable Computation</h2>
      {running ? (
        <>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {progress?.label ?? 'Starting…'} ({pct}%)
          </p>
          <button
            onClick={() => controllerRef.current?.abort()}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
          >
            Cancel
          </button>
        </>
      ) : result ? (
        <div className="space-y-2">
          <p className="rounded-md border border-green-400 bg-green-50 p-3 text-sm text-green-700">
            ✓ {result}
          </p>
          <button
            onClick={start}
            className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
          >
            Run again
          </button>
        </div>
      ) : error ? (
        <div className="space-y-2">
          <p className="rounded-md border border-red-400 bg-red-50 p-3 text-sm text-red-700">
            ✗ {error}
          </p>
          <button
            onClick={start}
            className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
          >
            Retry
          </button>
        </div>
      ) : (
        <button
          onClick={start}
          className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
        >
          Start computation
        </button>
      )}

      <div className="rounded-md border border-border bg-card p-4 space-y-3">
        <p className="text-sm font-semibold">✅ Why This Works</p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li><code className="rounded bg-muted px-1">AbortController</code> is created per run and stored in a ref — when the Cancel button fires or the component unmounts, <code className="rounded bg-muted px-1">controller.abort()</code> propagates the signal into the async work immediately.</li>
          <li><code className="rounded bg-muted px-1">signal.throwIfAborted()</code> inside <code className="rounded bg-muted px-1">heavyComputation</code> checks the signal at each step boundary, throwing <code className="rounded bg-muted px-1">DOMException(&apos;AbortError&apos;)</code> to stop work cleanly.</li>
          <li>The <code className="rounded bg-muted px-1">AbortError</code> guard in <code className="rounded bg-muted px-1">catch</code> distinguishes intentional cancellation from real errors — cancellation causes a silent return, not an error state.</li>
        </ul>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-md border border-red-800 bg-red-950/40 p-3">
            <p className="text-xs font-semibold text-red-400 mb-2">❌ Before</p>
            <pre className="text-xs text-red-200 whitespace-pre-wrap">{`// No cancellation — runs to completion
// even after unmount → setState warning
useEffect(() => {
  heavyComputation().then(setResult);
}, []);`}</pre>
          </div>
          <div className="rounded-md border border-green-800 bg-green-950/40 p-3">
            <p className="text-xs font-semibold text-green-400 mb-2">✅ After</p>
            <pre className="text-xs text-green-200 whitespace-pre-wrap">{`const controller = new AbortController();
heavyComputation(controller.signal, ...)
  .catch(err => {
    if (err.name === 'AbortError') return; // cancelled
    setError(err.message);
  });
return () => controller.abort(); // cleanup`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
