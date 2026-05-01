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
    </div>
  );
}
