'use client';
import { useState } from 'react';

// ❌ No encapsulation — count is a global, accessible from anywhere
let count = 0;
let step = 1;

const brokenCounter = {
  increment: () => { count += step; },
  decrement: () => { count -= step; },
  reset: () => { count = 0; },
  getCount: () => count,
  setStep: (n: number) => { step = n; },
  // BUG: internal state is fully exposed
  _count: count, // anyone can read/write this
  _step: step,
};

export default function ModulePatternIIFEBoilerplate(): React.JSX.Element {
  const [, forceRender] = useState(0);

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">Module Pattern (IIFE)</h2>
      <p className="text-sm text-muted-foreground">
        This counter uses global variables — internal state is exposed and can be tampered with.
      </p>
      <div className="flex gap-2">
        <button onClick={() => { brokenCounter.increment(); forceRender(n => n+1); }} className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent">+</button>
        <button onClick={() => { brokenCounter.decrement(); forceRender(n => n+1); }} className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent">-</button>
        <button onClick={() => { brokenCounter.reset(); forceRender(n => n+1); }} className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent">Reset</button>
        <button onClick={() => { brokenCounter.setStep(5); forceRender(n => n+1); }} className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent">Step=5</button>
      </div>
      <p className="text-sm font-mono">Count: {brokenCounter.getCount()}</p>
      <p className="text-xs text-red-500">Tamper: window.count = 999 would work on a real global</p>
    </div>
  );
}
