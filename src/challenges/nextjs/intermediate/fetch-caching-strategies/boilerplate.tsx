'use client';

/**
 * 🚧 BOILERPLATE
 *
 * All three panels fetch fresh data on every button click — no caching at all.
 * The badge always shows "FRESH". Your goal: apply the correct strategy to each:
 *
 *  Panel 1 — Site Config:   static (cache forever, fromCache should be true after first load)
 *  Panel 2 — Top Products:  tag-based (cache until invalidated by "Publish update")
 *  Panel 3 — Live Inventory: never cache (always "FRESH" — that's correct for this panel)
 *
 * In a real Next.js app you'd apply these via fetch() options in a Server Component.
 * Here the mock-api simulates Next.js cache semantics client-side so you can see
 * the cache-hit/miss behavior directly.
 *
 * Hints:
 *  - fetchSiteConfig() already has a cache — call it repeatedly and watch fromCache flip to true.
 *  - fetchTopProducts() is cache-invalidated by revalidateProducts().
 *  - fetchLiveInventory() never caches — equivalent to `cache: 'no-store'`.
 *
 * Tasks:
 *  1. Observe that config shows "CACHE HIT" after first load — that's the static strategy.
 *  2. Click "Publish product update" and observe products re-fetching.
 *  3. Add comments explaining which Next.js fetch option you'd use for each in production.
 */

import { useEffect, useState } from 'react';
import {
  fetchSiteConfig,
  fetchTopProducts,
  fetchLiveInventory,
  revalidateProducts,
  type SiteConfig,
  type TopProducts,
  type LiveInventory,
} from './mock-api';

export default function FetchCachingStrategiesBoilerplate(): React.JSX.Element {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [products, setProducts] = useState<TopProducts | null>(null);
  const [inventory, setInventory] = useState<LiveInventory | null>(null);
  const [loading, setLoading] = useState(false);

  const loadAll = async (): Promise<void> => {
    setLoading(true);
    // ❌ No caching differentiation — all three fetch the same way
    const [c, p, i] = await Promise.all([
      fetchSiteConfig(),
      fetchTopProducts(),
      fetchLiveInventory(),
    ]);
    setConfig(c);
    setProducts(p);
    setInventory(i);
    setLoading(false);
  };

  const handleInvalidateProducts = (): void => {
    revalidateProducts(); // simulates revalidateTag('products')
    void loadAll();
  };

  useEffect(() => {
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Next.js Caching Strategies</h2>
        <div className="flex gap-2">
          <button
            onClick={() => void loadAll()}
            disabled={loading}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Refetch all'}
          </button>
          <button
            onClick={handleInvalidateProducts}
            disabled={loading}
            className="rounded-md bg-secondary px-3 py-1.5 text-sm text-secondary-foreground disabled:opacity-50"
          >
            Publish product update
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        <Panel
          title="Site Config"
          strategy="❌ Should be: force-cache"
          note="fetch(url, { cache: 'force-cache' })"
          fromCache={config?.fromCache}
          loading={loading && !config}
        >
          {config ? (
            <div className="text-sm">
              <p>{config.siteName} v{config.version}</p>
              <p className="text-xs text-muted-foreground">Fetched at: {config.fetchedAt}</p>
            </div>
          ) : null}
        </Panel>

        <Panel
          title="Top Products"
          strategy="❌ Should be: tag-based revalidation"
          note="fetch(url, { next: { tags: ['products'] } })"
          fromCache={products?.fromCache}
          loading={loading && !products}
        >
          {products ? (
            <ul className="space-y-1 text-sm">
              {products.products.map((p) => (
                <li key={p.id} className="flex justify-between">
                  <span>{p.name}</span>
                  <span className="text-muted-foreground">{p.sales} sales</span>
                </li>
              ))}
            </ul>
          ) : null}
        </Panel>

        <Panel
          title="Live Inventory"
          strategy="✓ Correct: no-store"
          note="fetch(url, { cache: 'no-store' })"
          fromCache={inventory?.fromCache}
          loading={loading && !inventory}
        >
          {inventory ? (
            <ul className="space-y-1 text-sm">
              {inventory.items.map((item) => (
                <li key={item.sku} className="flex justify-between">
                  <span className="font-mono">{item.sku}</span>
                  <span className={item.stock < 50 ? 'text-red-500' : 'text-green-600'}>
                    {item.stock} units
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </Panel>
      </div>
    </div>
  );
}

function Panel({
  title,
  strategy,
  note,
  fromCache,
  loading,
  children,
}: {
  title: string;
  strategy: string;
  note: string;
  fromCache?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="rounded-md border p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{title}</span>
        <span
          className={`rounded px-1.5 py-0.5 text-xs font-mono ${
            fromCache
              ? 'bg-green-100 text-green-700'
              : 'bg-orange-100 text-orange-700'
          }`}
        >
          {loading ? '…' : fromCache ? 'CACHE HIT' : 'FRESH'}
        </span>
      </div>
      <p className="mb-2 text-xs text-muted-foreground">{strategy}</p>
      <code className="mb-2 block rounded bg-muted px-2 py-1 text-xs">{note}</code>
      {loading ? <p className="text-xs text-muted-foreground">Loading…</p> : children}
    </div>
  );
}
