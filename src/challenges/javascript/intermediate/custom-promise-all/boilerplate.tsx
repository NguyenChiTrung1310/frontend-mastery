'use client';
import { useState } from 'react';

// ❌ Broken: resolves with undefined entries instead of actual values
function myPromiseAll<T>(promises: Promise<T>[]): Promise<T[]> {
  return new Promise((resolve) => {
    const results: T[] = new Array(promises.length);
    // BUG: no counter, resolves after first completion, ignores rejections
    promises[0]?.then((v) => { results[0] = v; resolve(results); });
  });
}

export default function CustomPromiseAllBoilerplate(): React.JSX.Element {
  const [output, setOutput] = useState<string>('');

  const run = async () => {
    const p1 = Promise.resolve(1);
    const p2 = new Promise<number>(res => setTimeout(() => res(2), 100));
    const p3 = Promise.resolve(3);

    try {
      const results = await myPromiseAll([p1, p2, p3]);
      setOutput(`Results: [${results.join(', ')}] (expected [1, 2, 3])`);
    } catch (e) {
      setOutput(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">Custom Promise.all</h2>
      <button onClick={() => void run()} className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent">
        Run test
      </button>
      {output && <p className="text-sm font-mono">{output}</p>}
    </div>
  );
}
