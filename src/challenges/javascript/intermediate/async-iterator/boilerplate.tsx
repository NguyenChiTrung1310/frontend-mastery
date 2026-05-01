'use client';
import { useState } from 'react';

// Simulates a paginated API
async function fetchPage(page: number): Promise<{ items: string[]; hasMore: boolean }> {
  await new Promise(res => setTimeout(res, 100));
  if (page > 3) return { items: [], hasMore: false };
  return {
    items: [`item-${page * 3 - 2}`, `item-${page * 3 - 1}`, `item-${page * 3}`],
    hasMore: page < 3,
  };
}

// ❌ BUG: fetches all pages at once, no backpressure, ignores the generator protocol
async function* brokenPageIterator(): AsyncGenerator<string> {
  // Fetches ALL pages eagerly then yields — defeats the purpose of async iteration
  const all: string[] = [];
  for (let page = 1; page <= 10; page++) {
    const { items, hasMore } = await fetchPage(page);
    all.push(...items);
    if (!hasMore) break;
  }
  // Only starts yielding after everything is fetched
  for (const item of all) yield item;
}

export default function AsyncIteratorBoilerplate(): React.JSX.Element {
  const [items, setItems] = useState<string[]>([]);
  const [status, setStatus] = useState('');

  const run = async () => {
    setItems([]);
    setStatus('fetching...');
    // With the broken version, nothing appears until ALL pages are fetched
    for await (const item of brokenPageIterator()) {
      setItems(prev => [...prev, item]);
    }
    setStatus('done');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">Async Iterator</h2>
      <p className="text-sm text-muted-foreground">Broken: no streaming — all items appear at once after a long wait.</p>
      <button onClick={() => void run()} className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent">
        Fetch pages
      </button>
      <p className="text-xs text-muted-foreground">{status}</p>
      <ul className="space-y-1 text-sm font-mono">
        {items.map((item, i) => <li key={i} className="rounded bg-muted px-2 py-1">{item}</li>)}
      </ul>
    </div>
  );
}
