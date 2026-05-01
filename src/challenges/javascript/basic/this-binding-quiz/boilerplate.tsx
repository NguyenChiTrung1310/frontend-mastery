'use client';
import { useState } from 'react';

// BUG 1: method extracted as callback — `this` is lost
class Counter {
  count = 0;
  increment() { this.count++; return this.count; }
}
const counter = new Counter();
const brokenIncrement = counter.increment; // `this` will be undefined in strict mode

// BUG 2: setTimeout with regular function — `this` is window/undefined
class Timer {
  label = 'MyTimer';
  start() {
    return new Promise<string>((resolve) => {
      setTimeout(function(this: Timer | undefined) {
        resolve((this as Timer | undefined)?.label ?? 'undefined');
      }, 0);
    });
  }
}

// BUG 3: array method callback — `this` not bound
class Logger {
  prefix = '[LOG]';
  logAll(messages: string[]) {
    return messages.map(function(this: Logger | undefined, msg: string) {
      return `${(this as Logger | undefined)?.prefix ?? 'undefined'}: ${msg}`;
    });
  }
}

export default function ThisBindingQuizBoilerplate(): React.JSX.Element {
  const [results, setResults] = useState<string[]>([]);

  const runBug1 = () => {
    try {
      const result = brokenIncrement(); // TypeError in strict mode, or NaN
      setResults(prev => [...prev, `Bug 1 result: count = ${result}`]);
    } catch (e) {
      setResults(prev => [...prev, `Bug 1 threw: ${e instanceof Error ? e.message : String(e)}`]);
    }
  };

  const runBug2 = async () => {
    const timer = new Timer();
    const label = await timer.start();
    setResults(prev => [...prev, `Bug 2 label: "${label}" (expected "MyTimer")`]);
  };

  const runBug3 = () => {
    const logger = new Logger();
    const out = logger.logAll(['hello', 'world']);
    setResults(prev => [...prev, `Bug 3: ${out.join(', ')}`]);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">This Binding Quiz</h2>
      <p className="text-sm text-muted-foreground">Run each snippet — observe what goes wrong.</p>
      <div className="flex flex-wrap gap-2">
        <button onClick={runBug1} className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent">Run Bug 1</button>
        <button onClick={() => void runBug2()} className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent">Run Bug 2</button>
        <button onClick={runBug3} className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent">Run Bug 3</button>
      </div>
      <ul className="space-y-1 text-sm font-mono">
        {results.map((r, i) => <li key={i} className="rounded bg-muted px-2 py-1">{r}</li>)}
      </ul>
    </div>
  );
}
