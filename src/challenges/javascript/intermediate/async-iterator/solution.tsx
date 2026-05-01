'use client';

/**
 * ✅ SOLUTION — Async generator with pagination
 *
 * Key differences from the broken version:
 *
 *  1. `yield` happens INSIDE the async loop, not after collecting everything.
 *     Each yielded value is immediately available to the consumer via for-await-of.
 *     This is &quot;backpressure&quot;: the generator only fetches the next page when the consumer
 *     has finished processing the current one.
 *
 *  2. The generator protocol:
 *     - `for await...of` calls `.next()` on the generator each iteration.
 *     - `.next()` runs the generator until the next `yield` (or return).
 *     - The generator suspends at `yield`, control returns to the consumer.
 *     - When the consumer calls `.next()` again, the generator resumes.
 *
 *  3. Why this matters for UX:
 *     With eager collection: nothing shows until all pages arrive.
 *     With true streaming: each page&apos;s items appear as soon as that page loads.
 */

import { useState } from 'react';

async function fetchPage(page: number): Promise<{ items: string[]; hasMore: boolean }> {
  await new Promise(res => setTimeout(res, 300));
  if (page > 3) return { items: [], hasMore: false };
  return {
    items: [`item-${page * 3 - 2}`, `item-${page * 3 - 1}`, `item-${page * 3}`],
    hasMore: page < 3,
  };
}

async function* pageIterator(): AsyncGenerator<string> {
  let page = 1;
  while (true) {
    const { items, hasMore } = await fetchPage(page);
    // Yield each item from this page immediately — consumer sees it right away
    for (const item of items) {
      yield item;
    }
    // Only proceed to next page if more exist
    if (!hasMore) break;
    page++;
  }
}

export default function AsyncIteratorSolution(): React.JSX.Element {
  const [items, setItems] = useState<string[]>([]);
  const [status, setStatus] = useState('');

  const run = async () => {
    setItems([]);
    setStatus('streaming...');
    // Items appear page-by-page as each network call completes
    for await (const item of pageIterator()) {
      setItems(prev => [...prev, item]);
    }
    setStatus('done ✓');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">Async Iterator — Streaming</h2>
      <p className="text-sm text-muted-foreground">Items stream in page-by-page as each fetch completes.</p>
      <button onClick={() => void run()} className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground">
        Fetch pages
      </button>
      <p className="text-xs text-muted-foreground">{status}</p>
      <ul className="space-y-1 text-sm font-mono">
        {items.map((item, i) => <li key={i} className="rounded bg-green-50 border border-green-300 px-2 py-1 text-green-800">{item}</li>)}
      </ul>

      <div className="rounded-md border border-border bg-card p-4 space-y-3">
        <p className="text-sm font-semibold">✅ Why This Works</p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>The generator <code className="rounded bg-muted px-1">yield</code>s each item from the current page before fetching the next — the consumer sees results stream in rather than waiting for all pages.</li>
          <li><code className="rounded bg-muted px-1">for await...of</code> calls <code className="rounded bg-muted px-1">.next()</code> on the generator each iteration — the generator suspends at each <code className="rounded bg-muted px-1">yield</code> and only resumes when the consumer is ready.</li>
          <li>This is natural backpressure: the generator fetches the next page only after the consumer has processed the current one, avoiding wasteful eager collection.</li>
        </ul>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-md border border-red-800 bg-red-950/40 p-3">
            <p className="text-xs font-semibold text-red-400 mb-2">❌ Before</p>
            <pre className="text-xs text-red-200 whitespace-pre-wrap">{`// Collects ALL pages before yielding
const all = [];
while (hasMore) {
  all.push(...await fetchPage(page++));
}
yield* all; // nothing shows until done`}</pre>
          </div>
          <div className="rounded-md border border-green-800 bg-green-950/40 p-3">
            <p className="text-xs font-semibold text-green-400 mb-2">✅ After</p>
            <pre className="text-xs text-green-200 whitespace-pre-wrap">{`while (true) {
  const { items, hasMore } = await fetchPage(page);
  for (const item of items) yield item; // stream
  if (!hasMore) break;
  page++;
}`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
