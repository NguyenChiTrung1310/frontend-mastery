'use client';

/**
 * ✅ EXPERT SOLUTION
 *
 * Three pieces work together:
 *
 *   1. `useDeferredValue(query)` — gives us a "lagging" copy of the query that
 *      React will update at lower priority. The input itself stays bound to the
 *      immediate `query` state, so typing always feels instant.
 *
 *   2. `React.memo(ProductRow)` — rows whose props haven't changed skip render
 *      entirely. Combined with stable keys, this collapses per-keystroke work
 *      from O(total) to roughly O(matches).
 *
 *   3. `isStale` flag — when `query !== deferredQuery`, the list is mid-update.
 *      We dim it slightly so the user gets feedback without blocking on it.
 *
 * Things deliberately NOT done:
 *   - No virtualization. Slicing to the first 200 items mirrors the boilerplate
 *     so the comparison is honest. In production with truly long lists you'd
 *     reach for `react-virtuoso` or `@tanstack/react-virtual`.
 *   - No `useTransition`. `useDeferredValue` is the right tool for *derived*
 *     state. `useTransition` shines when you control the setter site directly
 *     (e.g. tab switches, route navigations).
 */

import { memo, useDeferredValue, useMemo, useState } from 'react';
import { generateProducts, type Product } from './mock-api';

const ALL_PRODUCTS = generateProducts(10_000);

export default function RenderOptimizationSolution(): React.JSX.Element {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;

  // Filter against the *deferred* query — the heavy work runs at low priority.
  const filtered = useMemo(() => {
    const needle = deferredQuery.toLowerCase();
    if (needle === '') return ALL_PRODUCTS;
    return ALL_PRODUCTS.filter((p) => p.name.toLowerCase().includes(needle));
  }, [deferredQuery]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Product Search (10,000 items)</h2>
        <span className="text-xs text-muted-foreground">
          {filtered.length.toLocaleString()} matches
          {isStale ? ' · updating…' : ''}
        </span>
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type as fast as you like — the input stays smooth"
        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <ul
        className="max-h-96 overflow-auto rounded-md border transition-opacity"
        style={{ opacity: isStale ? 0.55 : 1 }}
      >
        {filtered.slice(0, 200).map((p) => (
          <MemoProductRow key={p.id} product={p} />
        ))}
      </ul>
      {filtered.length > 200 ? (
        <p className="text-xs text-muted-foreground">
          Showing first 200 of {filtered.length.toLocaleString()} matches.
        </p>
      ) : null}
    </div>
  );
}

function ProductRow({ product }: { product: Product }): React.JSX.Element {
  return (
    <li className="flex items-center justify-between border-b px-3 py-2 text-sm last:border-0">
      <div>
        <p className="font-medium">{product.name}</p>
        <p className="text-xs text-muted-foreground">{product.category}</p>
      </div>
      <span className="font-mono text-sm">${product.price.toFixed(2)}</span>
    </li>
  );
}

// `memo` short-circuits re-renders when `product` reference is stable —
// which it is, because `ALL_PRODUCTS` never gets recreated.
const MemoProductRow = memo(ProductRow);
