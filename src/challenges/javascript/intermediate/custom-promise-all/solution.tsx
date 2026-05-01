'use client';

/**
 * ✅ SOLUTION — Promise.all internals
 *
 * Contract:
 *  - Resolve with results array (same order as input) when ALL promises settle successfully.
 *  - Reject immediately when ANY promise rejects — don't wait for others.
 *  - Empty input → resolve([]) synchronously.
 *
 * Key implementation details:
 *  1. Pre-fill results array to the correct length so we can write at index i
 *     regardless of which promise resolves first.
 *  2. Use a counter `settled` — only resolve the outer promise when it hits `promises.length`.
 *  3. Store `resolve` and `reject` in the outer scope; each `.then` can close over them.
 *  4. Short-circuit: once `reject` is called, subsequent resolves do nothing
 *     (a Promise can only transition once).
 */

import { useState } from 'react';

function myPromiseAll<T>(promises: Promise<T>[]): Promise<T[]> {
  // Edge case: empty array resolves immediately
  if (promises.length === 0) return Promise.resolve([]);

  return new Promise<T[]>((resolve, reject) => {
    const results = new Array<T>(promises.length);
    let settled = 0;

    promises.forEach((p, i) => {
      // Wrap in Promise.resolve so non-promise values also work
      void Promise.resolve(p).then((value) => {
        results[i] = value;
        settled++;
        // Only resolve once all promises have succeeded
        if (settled === promises.length) resolve(results);
      }, reject); // forward the rejection directly — first rejection wins
    });
  });
}

export default function CustomPromiseAllSolution(): React.JSX.Element {
  const [lines, setLines] = useState<string[]>([]);

  const run = async () => {
    setLines([]);
    // Test 1: normal resolution
    const r1 = await myPromiseAll([
      Promise.resolve(1),
      new Promise<number>(res => setTimeout(() => res(2), 80)),
      Promise.resolve(3),
    ]);
    setLines(prev => [...prev, `All resolve: [${r1.join(', ')}] ✓`]);

    // Test 2: empty array
    const r2 = await myPromiseAll<number>([]);
    setLines(prev => [...prev, `Empty: [${r2.join(', ')}] ✓`]);

    // Test 3: first rejection wins
    try {
      await myPromiseAll([
        Promise.resolve(1),
        Promise.reject(new Error('fail')),
        Promise.resolve(3),
      ]);
    } catch (e) {
      setLines(prev => [...prev, `Rejection caught: ${e instanceof Error ? e.message : String(e)} ✓`]);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">Custom Promise.all</h2>
      <button onClick={() => void run()} className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground">
        Run tests
      </button>
      <ul className="space-y-1 text-sm font-mono">
        {lines.map((l, i) => <li key={i} className="rounded bg-green-50 border border-green-300 px-2 py-1 text-green-800">{l}</li>)}
      </ul>

      <div className="rounded-md border border-border bg-card p-4 space-y-3">
        <p className="text-sm font-semibold">✅ Why This Works</p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>Results are written to <code className="rounded bg-muted px-1">results[i]</code> (pre-sized array) so the output order always matches input order regardless of which promise resolves first.</li>
          <li>A shared <code className="rounded bg-muted px-1">settled</code> counter increments on each resolve — the outer promise only resolves when it hits <code className="rounded bg-muted px-1">promises.length</code>, ensuring all must succeed.</li>
          <li>Passing <code className="rounded bg-muted px-1">reject</code> directly to the second <code className="rounded bg-muted px-1">.then</code> argument means the first rejection short-circuits immediately — subsequent resolves are no-ops on an already-settled promise.</li>
        </ul>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-md border border-red-800 bg-red-950/40 p-3">
            <p className="text-xs font-semibold text-red-400 mb-2">❌ Before</p>
            <pre className="text-xs text-red-200 whitespace-pre-wrap">{`// Broken: resolves before all settle
// or doesn't preserve order
function myPromiseAll(promises) {
  return Promise.resolve([]); // stub
}`}</pre>
          </div>
          <div className="rounded-md border border-green-800 bg-green-950/40 p-3">
            <p className="text-xs font-semibold text-green-400 mb-2">✅ After</p>
            <pre className="text-xs text-green-200 whitespace-pre-wrap">{`const results = new Array(promises.length);
let settled = 0;
promises.forEach((p, i) =>
  Promise.resolve(p).then(v => {
    results[i] = v;
    if (++settled === promises.length) resolve(results);
  }, reject)
);`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
