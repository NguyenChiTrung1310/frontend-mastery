'use client';

/**
 * 🚧 BOILERPLATE — your starting point.
 *
 * This component lags noticeably while typing because every keystroke triggers
 * a synchronous render of 10,000 list rows. Your goal is to fix it without
 * removing the real-time filter behavior.
 *
 * Hints:
 *  - The bottleneck isn't the filter math — it's React rendering 10k DOM nodes.
 *  - Look up `useDeferredValue` and `React.memo`.
 *  - Communicate "stale list" state visually (e.g. opacity).
 *
 * See the README pane on the left for the full walkthrough.
 */

import { useMemo, useState } from 'react';
import { generateProducts, type Product } from './mock-api';

const ALL_PRODUCTS = generateProducts(10_000);

export default function RenderOptimizationBoilerplate(): React.JSX.Element {
  const [query, setQuery] = useState('');

  // ❌ Problem: this filter and re-render runs synchronously on every keystroke.
  const filtered = useMemo(
    () =>
      ALL_PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Product Search (10,000 items)</h2>
        <span className="text-xs text-muted-foreground">
          {filtered.length.toLocaleString()} matches
        </span>
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Try typing fast — feel the jank…"
        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <ul className="max-h-96 overflow-auto rounded-md border">
        {filtered.slice(0, 200).map((p) => (
          <ProductRow key={p.id} product={p} />
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
