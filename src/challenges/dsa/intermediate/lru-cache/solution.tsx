'use client';

/**
 * ✅ SOLUTION
 *
 * Map-based LRU. Why this works in O(1):
 *
 *  - `Map` lookups (`get`, `has`, `set`, `delete`) are all O(1) average.
 *  - `Map` iterates in **insertion order**. So the first key returned by
 *    `this.store.keys().next().value` is always the least recently inserted/touched.
 *  - To "refresh" a key on access, we `delete` then `set` — that pops it to the end
 *    of the iteration order, marking it as most recently used.
 *
 * Compare to the doubly-linked-list + hashmap approach (which you'd write in C++
 * or Java): the algorithmic complexity is identical, but the JS version is
 * dramatically less code because `Map` already gives you the ordered store.
 *
 * Tradeoff: the `delete`+`set` dance allocates a tiny bit of internal map
 * housekeeping on every `get`. If you're caching millions of items in a hot
 * loop, the explicit linked-list version can be faster due to cache locality.
 * For 99% of frontend use cases, this is the right answer.
 */

import { useState } from 'react';

class LRUCache<K, V> {
  private readonly store = new Map<K, V>();

  constructor(private readonly capacity: number) {
    if (capacity <= 0) throw new RangeError('capacity must be positive');
  }

  get(key: K): V | undefined {
    if (!this.store.has(key)) return undefined;
    // Re-insert to move to MRU position. The non-null assertion is safe — we just
    // checked `has()`, and `V` is whatever the user stored (which could legitimately
    // be `undefined`, so we use the `has`-then-`get` pattern rather than `get` alone).
    const value = this.store.get(key) as V;
    this.store.delete(key);
    this.store.set(key, value);
    return value;
  }

  put(key: K, value: V): void {
    if (this.store.has(key)) {
      this.store.delete(key); // ensure re-insertion order updates
    } else if (this.store.size >= this.capacity) {
      // Evict the LRU = first key in insertion order
      const lruKey = this.store.keys().next().value as K | undefined;
      if (lruKey !== undefined) this.store.delete(lruKey);
    }
    this.store.set(key, value);
  }

  get size(): number {
    return this.store.size;
  }

  /** Bonus: iterate MRU → LRU. Default Map order is LRU → MRU, so we reverse. */
  *[Symbol.iterator](): IterableIterator<[K, V]> {
    const entries = Array.from(this.store.entries());
    for (let i = entries.length - 1; i >= 0; i--) {
      const entry = entries[i];
      if (entry !== undefined) yield entry;
    }
  }
}

interface TestResult {
  name: string;
  passed: boolean;
}

function runTests(): TestResult[] {
  const results: TestResult[] = [];

  {
    const cache = new LRUCache<string, number>(2);
    cache.put('a', 1);
    cache.put('b', 2);
    results.push({
      name: 'basic get/put',
      passed: cache.get('a') === 1 && cache.get('b') === 2,
    });
  }
  {
    const cache = new LRUCache<string, number>(2);
    cache.put('a', 1);
    cache.put('b', 2);
    cache.put('c', 3);
    results.push({
      name: 'evicts LRU at capacity',
      passed:
        cache.get('a') === undefined && cache.get('b') === 2 && cache.get('c') === 3,
    });
  }
  {
    const cache = new LRUCache<string, number>(2);
    cache.put('a', 1);
    cache.put('b', 2);
    cache.get('a');
    cache.put('c', 3);
    results.push({
      name: 'get refreshes recency',
      passed:
        cache.get('a') === 1 && cache.get('b') === undefined && cache.get('c') === 3,
    });
  }
  {
    const cache = new LRUCache<string, number>(2);
    cache.put('a', 1);
    cache.put('a', 99);
    results.push({
      name: 'put overwrites and refreshes',
      passed: cache.get('a') === 99 && cache.size === 1,
    });
  }

  return results;
}

export default function LruCacheSolution(): React.JSX.Element {
  const [results, setResults] = useState<TestResult[]>([]);

  const handleRun = (): void => {
    const r = runTests();
    setResults(r);
    console.log('--- Test Results (Solution) ---');
    r.forEach((t) =>
      t.passed ? console.log(`✓ ${t.name}`) : console.error(`✗ ${t.name}`),
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        All four tests pass. Iteration order goes MRU → LRU (see the bonus task).
      </p>
      <button
        onClick={handleRun}
        className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
      >
        Run tests
      </button>
      <ul className="space-y-1 text-sm">
        {results.map((r) => (
          <li key={r.name} className={r.passed ? 'text-green-600' : 'text-red-600'}>
            {r.passed ? '✓' : '✗'} {r.name}
          </li>
        ))}
      </ul>

      <div className="rounded-md border border-border bg-card p-4 space-y-3">
        <p className="text-sm font-semibold">✅ Why This Works</p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>JavaScript <code className="rounded bg-muted px-1">Map</code> iterates in insertion order — the first key is always the LRU, so eviction is O(1) without a doubly linked list.</li>
          <li>On <code className="rounded bg-muted px-1">get</code>, the key is deleted then re-inserted to move it to the MRU (tail) position — the <code className="rounded bg-muted px-1">delete+set</code> dance is the entire recency update.</li>
          <li>On <code className="rounded bg-muted px-1">put</code> at capacity, <code className="rounded bg-muted px-1">keys().next().value</code> retrieves the LRU key in O(1) for immediate eviction.</li>
        </ul>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-md border border-red-800 bg-red-950/40 p-3">
            <p className="text-xs font-semibold text-red-400 mb-2">❌ Before</p>
            <pre className="text-xs text-red-200 whitespace-pre-wrap">{`// O(n) eviction — scan all entries
get(key) {
  // no recency update → wrong eviction order
  return this.store[key];
}`}</pre>
          </div>
          <div className="rounded-md border border-green-800 bg-green-950/40 p-3">
            <p className="text-xs font-semibold text-green-400 mb-2">✅ After</p>
            <pre className="text-xs text-green-200 whitespace-pre-wrap">{`get(key) {
  const value = this.store.get(key)!;
  this.store.delete(key); // remove
  this.store.set(key, value); // re-insert → MRU
  return value;
}`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
