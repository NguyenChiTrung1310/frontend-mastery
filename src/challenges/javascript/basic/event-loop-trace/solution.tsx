'use client';

/**
 * ✅ SOLUTION — Event loop order
 *
 * Mental model:
 *  - Synchronous code runs first, filling the call stack.
 *  - When the call stack empties, the engine drains ALL microtasks (Promise .then callbacks).
 *  - Only after the microtask queue is empty does the next macrotask (setTimeout callback) run.
 *  - "Zero-delay" setTimeout(fn, 0) still waits for at least one full macrotask turn.
 *
 * Snippet 1 — A D C B:
 *   sync: A, D logged → stack empty
 *   microtask queue: C (Promise.resolve().then)
 *   macrotask queue: B (setTimeout)
 *   → drain microtasks first: C → then macrotask: B
 *   Output: A D C B
 *
 * Snippet 2 — 1 3 2:
 *   Two separate Promise chains. Both register their FIRST .then in the same microtask tick.
 *   Microtask queue (tick 1): [1, 3] → both run → 1 logged, then 3 logged
 *   Logging 1 resolves the first chain → queues .then(&apos;2&apos;) as a new microtask
 *   Microtask queue (tick 2): [2] → 2 logged
 *   Output: 1 3 2
 *
 * Snippet 3 — Z W X Y:
 *   sync: setTimeout(X,0), setTimeout(Y,0) — macrotasks queued; Promise.then(Z) — microtask queued
 *   drain microtasks: Z logged; inside that handler, Promise.resolve().then(W) — new microtask queued
 *   continue draining microtasks: W logged
 *   macrotask queue now: [X, Y]
 *   X logged, Y logged
 *   Output: Z W X Y
 */

import { useState } from 'react';

const SNIPPETS = [
  {
    code: `console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
console.log('D');`,
    options: ['A D B C', 'A D C B', 'A B C D', 'A C D B'],
    correct: 1,
    explanation: 'Sync: A, D. Microtask: C. Macrotask: B.',
  },
  {
    code: `Promise.resolve()
  .then(() => console.log('1'))
  .then(() => console.log('2'));
Promise.resolve().then(() => console.log('3'));`,
    options: ['1 2 3', '1 3 2', '3 1 2', '2 3 1'],
    correct: 1,
    explanation: 'Both chains queue first handlers together: 1, 3. Then 2 (chained from 1).',
  },
  {
    code: `setTimeout(() => console.log('X'), 0);
setTimeout(() => console.log('Y'), 0);
Promise.resolve().then(() => {
  console.log('Z');
  Promise.resolve().then(() => console.log('W'));
});`,
    options: ['Z W X Y', 'X Y Z W', 'Z X W Y', 'X Z W Y'],
    correct: 0,
    explanation: 'Microtasks (Z, then W) drain completely before any macrotask (X, Y).',
  },
];

export default function EventLoopTraceSolution(): React.JSX.Element {
  const [selected, setSelected] = useState(SNIPPETS.map(s => s.correct));

  return (
    <div className="space-y-6">
      <h2 className="text-base font-semibold">Event Loop Trace — Solution</h2>
      {SNIPPETS.map((s, si) => (
        <div key={si} className="space-y-2">
          <pre className="rounded bg-muted p-3 text-xs">{s.code}</pre>
          <div className="space-y-1">
            {s.options.map((opt, oi) => (
              <label key={oi} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name={`q${si}`} checked={selected[si] === oi}
                  onChange={() => setSelected(prev => { const n=[...prev]; n[si]=oi; return n; })} />
                <span className={oi === s.correct ? 'text-green-700 font-medium' : ''}>{opt}</span>
                {oi === s.correct && <span className="text-green-600 text-xs">✓</span>}
              </label>
            ))}
          </div>
          {selected[si] === s.correct && (
            <p className="text-xs text-muted-foreground border-l-2 border-green-400 pl-2">{s.explanation}</p>
          )}
        </div>
      ))}
      <div className="rounded-md border border-border bg-card p-4 space-y-3">
        <p className="text-sm font-semibold">✅ Why This Works</p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>Synchronous code runs first, filling the call stack — nothing async can interrupt it mid-execution.</li>
          <li>When the call stack empties, the engine drains ALL microtasks (Promise <code className="rounded bg-muted px-1">.then</code>) before picking up the next macrotask (<code className="rounded bg-muted px-1">setTimeout</code>).</li>
          <li>A microtask can queue more microtasks — they all drain before any macrotask runs, which is why nested <code className="rounded bg-muted px-1">Promise.resolve().then</code> still runs before <code className="rounded bg-muted px-1">setTimeout(fn, 0)</code>.</li>
        </ul>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-md border border-red-800 bg-red-950/40 p-3">
            <p className="text-xs font-semibold text-red-400 mb-2">❌ Common mistake</p>
            <pre className="text-xs text-red-200 whitespace-pre-wrap">{`// Assuming setTimeout(fn, 0) runs "immediately"
// Output: A D B C  ← wrong
// Assuming microtasks interleave macrotasks`}</pre>
          </div>
          <div className="rounded-md border border-green-800 bg-green-950/40 p-3">
            <p className="text-xs font-semibold text-green-400 mb-2">✅ Mental model</p>
            <pre className="text-xs text-green-200 whitespace-pre-wrap">{`// 1. Run all sync code
// 2. Drain ALL microtasks (repeat until empty)
// 3. Run ONE macrotask
// 4. Go to step 2`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
