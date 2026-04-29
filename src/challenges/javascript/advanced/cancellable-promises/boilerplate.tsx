'use client';

/**
 * 🚧 BOILERPLATE
 *
 * The component below starts a `heavyComputation` but never cancels it.
 * Problems:
 *  1. Unmounting mid-run causes "setState on unmounted component" warnings.
 *  2. Clicking "Cancel" visually clears the UI but the work keeps running in the background.
 *
 * Your goals:
 *  A. Wire up AbortController in the useEffect so computation cancels on unmount.
 *  B. Make the "Cancel" button call controller.abort().
 *  C. Distinguish AbortError from real errors in the catch block.
 *
 * Hints:
 *  - Create `const controller = new AbortController()` inside useEffect.
 *  - Pass `controller.signal` to `heavyComputation`.
 *  - Return `() => controller.abort()` as the cleanup.
 *  - In the catch: `if (err instanceof Error && err.name === 'AbortError') return;`
 */

import { useEffect, useRef, useState } from 'react';
import { heavyComputation, type ComputationProgress } from './mock-api';

export default function CancellablePromisesBoilerplate(): React.JSX.Element {
  const [progress, setProgress] = useState<ComputationProgress | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  // ❌ TODO: replace this ref with a proper AbortController inside useEffect
  const cancelledRef = useRef(false);

  const start = (): void => {
    setProgress(null);
    setResult(null);
    setError(null);
    setRunning(true);
    cancelledRef.current = false;

    // ❌ No AbortController — cancellation is only cosmetic
    void heavyComputation(new AbortController().signal, (p) => {
      if (!cancelledRef.current) setProgress(p);
    })
      .then((r) => {
        if (!cancelledRef.current) {
          setResult(r);
          setRunning(false);
        }
      })
      .catch((err: unknown) => {
        // ❌ Treats AbortError the same as a real failure
        setError(err instanceof Error ? err.message : String(err));
        setRunning(false);
      });
  };

  const cancel = (): void => {
    // ❌ Only clears the UI — the computation keeps running
    cancelledRef.current = true;
    setRunning(false);
    setProgress(null);
  };

  useEffect(() => {
    start();
    // ❌ No cleanup — computation leaks if the component unmounts
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
              className="h-full bg-primary transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">{progress?.label ?? 'Starting…'}</p>
          <button
            onClick={cancel}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
          >
            Cancel
          </button>
        </>
      ) : result ? (
        <p className="rounded-md border border-green-400 bg-green-50 p-3 text-sm text-green-700">
          ✓ {result}
        </p>
      ) : error ? (
        <p className="rounded-md border border-red-400 bg-red-50 p-3 text-sm text-red-700">
          ✗ {error}
        </p>
      ) : (
        <button
          onClick={start}
          className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
        >
          Start computation
        </button>
      )}
    </div>
  );
}
