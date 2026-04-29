'use client';

/**
 * 🚧 BOILERPLATE
 *
 * Implement an LRU cache with O(1) `get` and `put`.
 * Click "Run tests" — the console panel below will show pass/fail.
 *
 * Hints:
 *  - JavaScript's built-in `Map` iterates in insertion order. Use that.
 *  - On `get`, if you `delete` and re-`set`, the key moves to the end (most recent).
 *  - On `put`, if at capacity, the first key from `keys().next()` is the LRU.
 */

import { useState } from 'react';

class LRUCache<K, V> {
  // ❌ TODO: replace this naive impl
  private store = new Map<K, V>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(private readonly capacity: number) {}

  get(key: K): V | undefined {
    return this.store.get(key);
  }

  put(key: K, value: V): void {
    this.store.set(key, value);
    // ❌ no eviction yet, no recency tracking
  }

  get size(): number {
    return this.store.size;
  }
}

interface TestResult {
  name: string;
  passed: boolean;
  detail?: string;
}

function runTests(): TestResult[] {
  const results: TestResult[] = [];

  // Test 1 — basic get/put
  {
    const cache = new LRUCache<string, number>(2);
    cache.put('a', 1);
    cache.put('b', 2);
    const passed = cache.get('a') === 1 && cache.get('b') === 2;
    results.push({ name: 'basic get/put', passed });
  }

  // Test 2 — eviction at capacity
  {
    const cache = new LRUCache<string, number>(2);
    cache.put('a', 1);
    cache.put('b', 2);
    cache.put('c', 3); // should evict 'a'
    const passed = cache.get('a') === undefined && cache.get('b') === 2 && cache.get('c') === 3;
    results.push({ name: 'evicts LRU at capacity', passed });
  }

  // Test 3 — get marks as MRU
  {
    const cache = new LRUCache<string, number>(2);
    cache.put('a', 1);
    cache.put('b', 2);
    cache.get('a'); // 'a' becomes MRU
    cache.put('c', 3); // should evict 'b', not 'a'
    const passed = cache.get('a') === 1 && cache.get('b') === undefined && cache.get('c') === 3;
    results.push({ name: 'get refreshes recency', passed });
  }

  // Test 4 — overwriting a key
  {
    const cache = new LRUCache<string, number>(2);
    cache.put('a', 1);
    cache.put('a', 99); // overwrite
    const passed = cache.get('a') === 99 && cache.size === 1;
    results.push({ name: 'put overwrites and refreshes', passed });
  }

  return results;
}

export default function LruCacheBoilerplate(): React.JSX.Element {
  const [results, setResults] = useState<TestResult[]>([]);

  const handleRun = (): void => {
    const r = runTests();
    setResults(r);
    console.log('--- Test Results ---');
    r.forEach((t) =>
      t.passed ? console.log(`✓ ${t.name}`) : console.error(`✗ ${t.name}`),
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Implement <code>LRUCache</code> at the top of the file, then run the tests.
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
    </div>
  );
}
