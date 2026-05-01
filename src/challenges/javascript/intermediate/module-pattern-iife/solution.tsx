'use client';

/**
 * ✅ SOLUTION — Revealing Module Pattern via IIFE
 *
 * The IIFE runs immediately and returns an object containing only the PUBLIC interface.
 * Internal variables (count, step) live inside the IIFE&apos;s closure scope — they are
 * completely inaccessible from outside. You cannot do `counter._count`.
 *
 * Why closures provide true privacy:
 *  - A closure captures references to variables in its enclosing scope.
 *  - Those variables are only accessible through the functions that close over them.
 *  - There is no way to reach into a closed-over scope from outside.
 *
 * IIFE = Immediately Invoked Function Expression: (function() { ... })()
 * Modern alternative: ES module scope gives you the same privacy via `export`.
 * But the IIFE pattern appears in legacy code everywhere — knowing it is essential.
 *
 * &quot;Revealing&quot; = the pattern where you define everything as internal functions first,
 * then REVEAL only the ones you want public in the returned object.
 */

import { useState } from 'react';

const counter = (() => {
  // Private state — closure-scoped, unreachable from outside
  let count = 0;
  let step = 1;

  // Private helpers (could exist; not exposed)
  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

  // Public API — only these are returned
  return {
    increment: () => { count += step; },
    decrement: () => { count -= step; },
    reset: () => { count = 0; step = 1; },
    getCount: () => count,
    setStep: (n: number) => { step = clamp(n, 1, 100); },
    getStep: () => step,
  };
})();

export default function ModulePatternIIFESolution(): React.JSX.Element {
  const [, forceRender] = useState(0);

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">Module Pattern (IIFE) — Fixed</h2>
      <p className="text-sm text-muted-foreground">
        Internal state is closure-private. No external code can access or mutate count/step directly.
      </p>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => { counter.increment(); forceRender(n => n+1); }} className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground">+</button>
        <button onClick={() => { counter.decrement(); forceRender(n => n+1); }} className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground">-</button>
        <button onClick={() => { counter.reset(); forceRender(n => n+1); }} className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent">Reset</button>
        <button onClick={() => { counter.setStep(5); forceRender(n => n+1); }} className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent">Step=5</button>
      </div>
      <p className="text-sm font-mono">Count: {counter.getCount()} (step: {counter.getStep()})</p>

      <div className="rounded-md border border-border bg-card p-4 space-y-3">
        <p className="text-sm font-semibold">✅ Why This Works</p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>The IIFE runs immediately and returns only the public API — internal variables (<code className="rounded bg-muted px-1">count</code>, <code className="rounded bg-muted px-1">step</code>) are closure-scoped and completely unreachable from outside.</li>
          <li>&quot;Revealing&quot; means all functions are defined as privates first, then selectively exposed in the returned object — what you don&apos;t return, callers can never access.</li>
          <li>Modern ES modules give you the same privacy via <code className="rounded bg-muted px-1">export</code> — but the IIFE pattern appears everywhere in pre-module legacy code and bundled libraries.</li>
        </ul>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-md border border-red-800 bg-red-950/40 p-3">
            <p className="text-xs font-semibold text-red-400 mb-2">❌ Before</p>
            <pre className="text-xs text-red-200 whitespace-pre-wrap">{`// Global mutable state — fully exposed
let count = 0;
function increment() { count++; }
// count is readable/writable by anyone`}</pre>
          </div>
          <div className="rounded-md border border-green-800 bg-green-950/40 p-3">
            <p className="text-xs font-semibold text-green-400 mb-2">✅ After</p>
            <pre className="text-xs text-green-200 whitespace-pre-wrap">{`const counter = (() => {
  let count = 0; // private
  return {
    increment: () => { count++; },
    getCount: () => count,
  };
})();`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
