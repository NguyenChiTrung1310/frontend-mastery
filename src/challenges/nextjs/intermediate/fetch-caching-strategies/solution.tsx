'use client';

/**
 * ✅ SOLUTION — Next.js fetch caching strategies
 *
 * This client-side simulation mirrors what Next.js does in Server Components.
 * The real Next.js equivalents are shown in comments next to each fetch.
 *
 * Strategy map:
 *
 *  Site Config — force-cache (static)
 *    In production: fetch(url, { cache: 'force-cache' })
 *    Or at segment level: export const revalidate = false
 *    Why: Site config almost never changes. Cache it at build time and serve
 *    from the edge CDN with zero latency. Redeploy clears the cache automatically.
 *
 *  Top Products — tag-based revalidation
 *    In production: fetch(url, { next: { tags: ['products'] } })
 *    Invalidate with: import { revalidateTag } from 'next/cache'; revalidateTag('products')
 *    Why: Data changes on demand (when a product is updated in the CMS), not on a timer.
 *    Tag-based lets you surgically clear just this data without invalidating the whole page.
 *
 *  Live Inventory — no-store (always dynamic)
 *    In production: fetch(url, { cache: 'no-store' })
 *    Or at segment level: export const dynamic = 'force-dynamic'
 *    Why: Stock numbers change every second. Any caching would show wrong counts.
 *    Note: using no-store here opts the entire route segment into dynamic rendering.
 *
 * Segment-level vs call-level:
 *   `export const revalidate = 60` applies to every fetch in the segment.
 *   `fetch(url, { next: { revalidate: 60 } })` applies to one specific data source.
 *   Prefer call-level for mixed strategies (some static, some dynamic on the same page).
 *   Use segment-level as the default when every fetch in a page has the same strategy.
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

export default function FetchCachingStrategiesSolution(): React.JSX.Element {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [products, setProducts] = useState<TopProducts | null>(null);
  const [inventory, setInventory] = useState<LiveInventory | null>(null);
  const [loading, setLoading] = useState(false);

  const loadAll = async (): Promise<void> => {
    setLoading(true);
    const [c, p, i] = await Promise.all([
      fetchSiteConfig(),       // force-cache — will show CACHE HIT after first load
      fetchTopProducts(),      // tag-based — shows CACHE HIT until revalidateProducts() fires
      fetchLiveInventory(),    // no-store — always FRESH
    ]);
    setConfig(c);
    setProducts(p);
    setInventory(i);
    setLoading(false);
  };

  const handlePublishUpdate = (): void => {
    // Simulates: import { revalidateTag } from 'next/cache'; revalidateTag('products')
    revalidateProducts();
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
            onClick={handlePublishUpdate}
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
          strategy="✓ force-cache (static)"
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
          strategy="✓ Tag-based revalidation"
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
          strategy="✓ no-store (always dynamic)"
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

      <p className="text-xs text-muted-foreground">
        Click &quot;Refetch all&quot; — Config stays CACHE HIT, Inventory is always FRESH.
        Click &quot;Publish product update&quot; — Products clears and refetches once.
      </p>

      <div className="rounded-md border border-border bg-card p-4 space-y-3">
        <p className="text-sm font-semibold">✅ Why This Works</p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li><code className="rounded bg-muted px-1">force-cache</code> locks data at build time and serves from CDN with zero latency — right for data that almost never changes like site config.</li>
          <li>Tag-based revalidation lets you surgically clear one data source (<code className="rounded bg-muted px-1">revalidateTag(&apos;products&apos;)</code>) on CMS publish without invalidating the whole page.</li>
          <li><code className="rounded bg-muted px-1">no-store</code> bypasses all caching — mandatory for live inventory where any cached value would be wrong.</li>
        </ul>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-md border border-red-800 bg-red-950/40 p-3">
            <p className="text-xs font-semibold text-red-400 mb-2">❌ Before</p>
            <pre className="text-xs text-red-200 whitespace-pre-wrap">{`// Same cache strategy for all data
fetch(url) // default: force-cache
// live inventory shows stale stock
// static config re-fetches every request`}</pre>
          </div>
          <div className="rounded-md border border-green-800 bg-green-950/40 p-3">
            <p className="text-xs font-semibold text-green-400 mb-2">✅ After</p>
            <pre className="text-xs text-green-200 whitespace-pre-wrap">{`fetch(configUrl, { cache: 'force-cache' })
fetch(prodUrl, { next: { tags: ['products'] } })
fetch(invUrl, { cache: 'no-store' })`}</pre>
          </div>
        </div>
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
      <p className="mb-1 text-xs font-medium text-foreground">{strategy}</p>
      <code className="mb-2 block rounded bg-muted px-2 py-1 text-xs">{note}</code>
      {loading ? <p className="text-xs text-muted-foreground">Loading…</p> : children}
    </div>
  );
}
