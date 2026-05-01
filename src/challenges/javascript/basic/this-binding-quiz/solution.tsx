'use client';

/**
 * ✅ SOLUTION — this binding
 *
 * Rule: `this` is set by HOW a function is called, not WHERE it's defined.
 *
 * Three patterns that lose `this`:
 *  1. Extracting a method as a variable: `const fn = obj.method` — call site has no object
 *  2. setTimeout/callback with `function` keyword — `this` is global/undefined in strict mode
 *  3. Array method callbacks (`map`, `forEach`) with `function` — same as above
 *
 * Three fixes:
 *  A. `.bind(obj)` — returns a new function permanently bound to `obj`
 *  B. Arrow function — captures `this` lexically from the surrounding scope at definition time
 *  C. Explicit wrapper: `() => obj.method()` — call site re-establishes `this`
 */

import { useState } from 'react';

// FIX 1: bind at extraction time
class Counter {
  count = 0;
  increment() { this.count++; return this.count; }
}
const counter = new Counter();
// .bind(counter) locks `this` to the counter instance permanently
const fixedIncrement = counter.increment.bind(counter);

// FIX 2: arrow function in setTimeout captures lexical `this`
class Timer {
  label = 'MyTimer';
  start() {
    return new Promise<string>((resolve) => {
      // Arrow function: `this` is the Timer instance from the outer `start` scope
      setTimeout(() => {
        resolve(this.label);
      }, 0);
    });
  }
}

// FIX 3: arrow function in map — no separate `this` binding needed
class Logger {
  prefix = '[LOG]';
  logAll(messages: string[]) {
    // Arrow function captures `this` (the Logger instance) from logAll's scope
    return messages.map((msg) => `${this.prefix}: ${msg}`);
  }
}

export default function ThisBindingQuizSolution(): React.JSX.Element {
  const [results, setResults] = useState<string[]>([]);

  const runFix1 = () => {
    const result = fixedIncrement();
    setResults(prev => [...prev, `Fix 1: count = ${result} ✓`]);
  };

  const runFix2 = async () => {
    const timer = new Timer();
    const label = await timer.start();
    setResults(prev => [...prev, `Fix 2: label = "${label}" ✓`]);
  };

  const runFix3 = () => {
    const logger = new Logger();
    const out = logger.logAll(['hello', 'world']);
    setResults(prev => [...prev, `Fix 3: ${out.join(', ')} ✓`]);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">This Binding — Fixed</h2>
      <div className="flex flex-wrap gap-2">
        <button onClick={runFix1} className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground">Run Fix 1</button>
        <button onClick={() => void runFix2()} className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground">Run Fix 2</button>
        <button onClick={runFix3} className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground">Run Fix 3</button>
      </div>
      <ul className="space-y-1 text-sm font-mono">
        {results.map((r, i) => <li key={i} className="rounded bg-green-50 border border-green-300 px-2 py-1 text-green-800">{r}</li>)}
      </ul>

      <div className="rounded-md border border-border bg-card p-4 space-y-3">
        <p className="text-sm font-semibold">✅ Why This Works</p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li><code className="rounded bg-muted px-1">this</code> is set by HOW a function is called, not where it&apos;s defined — extracting a method as a variable loses the object context at the call site.</li>
          <li>Arrow functions have no own <code className="rounded bg-muted px-1">this</code> — they capture it lexically from the surrounding scope at definition time, making them immune to context loss in callbacks.</li>
          <li><code className="rounded bg-muted px-1">.bind(obj)</code> returns a new function permanently bound to <code className="rounded bg-muted px-1">obj</code> — useful when you can&apos;t control the call site (event handlers, timers).</li>
        </ul>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-md border border-red-800 bg-red-950/40 p-3">
            <p className="text-xs font-semibold text-red-400 mb-2">❌ Before</p>
            <pre className="text-xs text-red-200 whitespace-pre-wrap">{"const fn = obj.method; // loses 'this'\nfn(); // TypeError or undefined\n\nsetTimeout(function() {\n  this.label; // 'this' is global/undefined\n}, 0);"}</pre>
          </div>
          <div className="rounded-md border border-green-800 bg-green-950/40 p-3">
            <p className="text-xs font-semibold text-green-400 mb-2">✅ After</p>
            <pre className="text-xs text-green-200 whitespace-pre-wrap">{"const fn = obj.method.bind(obj); // Fix 1\nfn(); // 'this' is obj\n\nsetTimeout(() => {\n  this.label; // Fix 2: arrow captures 'this'\n}, 0);"}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
