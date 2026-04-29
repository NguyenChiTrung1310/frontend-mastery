# Mastering fetch Caching

## 🎯 Scenario

Your Next.js dashboard has three panels:
1. **Site config** — almost never changes. Should be cached forever (or until a deploy).
2. **Top products** — updated every few hours. Should be revalidated on a timer.
3. **Live inventory** — changes every request. Should never be cached.

The boilerplate fetches all three with a plain `fetch()` on every render. Your job: apply the correct Next.js caching directive to each panel and understand *why* each choice wins.

---

## 📂 Files

- `boilerplate.tsx` — Three panels each doing a naive always-fresh fetch. Edit this.
- `solution.tsx` — The correct caching strategy per panel, with visual cache-hit indicators.
- `mock-api.ts` — Simulated data sources with cache-hit tracking.

---

## ❓ The Four Caching Strategies

Next.js extends `fetch()` with a `next` option:

### 1. Static (force-cache)
```ts
fetch(url, { cache: 'force-cache' })
// or: export const revalidate = false (segment-level)
```
- Cached at build time. Never refetched until you redeploy.
- Use for: site config, static copy, legal text, product descriptions.

### 2. Time-based Revalidation (ISR)
```ts
fetch(url, { next: { revalidate: 3600 } }) // seconds
// or: export const revalidate = 3600 (segment-level)
```
- Cached after first request. Stale-while-revalidate: serve the old value, refresh in background.
- Use for: product listings, blog posts, pricing — "mostly static but updated periodically".

### 3. Tag-based Revalidation
```ts
fetch(url, { next: { tags: ['products'] } })
// then in a Server Action: revalidateTag('products')
```
- Cached until explicitly invalidated by a tag. Perfect for CMS content or after a mutation.
- Use for: content that changes on demand (new blog post published, product edited).

### 4. No Cache (dynamic)
```ts
fetch(url, { cache: 'no-store' })
// or: export const dynamic = 'force-dynamic'
```
- Fetched fresh on every request. Opts the entire segment into dynamic rendering.
- Use for: stock prices, live scores, per-user data, anything with auth headers.

---

## 🧠 The Caching Mental Model

```
Build time → Static cache (force-cache, revalidate: false)
     ↓
Deploy → cache is populated
     ↓
Request N   → serve from cache, kick off background revalidation (if revalidate: N seconds)
     ↓
Mutation → revalidateTag() or revalidatePath() clears cache for that data
     ↓
Next request → fresh fetch, re-populated cache
```

**Key insight**: Next.js caching is at the *data* level (per fetch call), not the *page* level. A single page can have some static, some time-based, and some dynamic data — Next.js optimises each independently.

---

## ✅ Tasks

### Task 1 — Identify each panel's strategy

Look at the three mock data sources and decide: force-cache / revalidate:N / no-store?

### Task 2 — Apply in the solution

Add the correct `fetch` option to each panel. The cache-hit indicator in the UI will show whether data came from cache or a fresh fetch.

### Task 3 — Demonstrate tag-based revalidation

Add a "Publish product update" button that calls a simulated `revalidateTag('products')` function and observe the cache clearing on the next fetch.

### Task 4 — Segment-level vs call-level

Explain (in comments) when you'd use `export const revalidate = 60` vs `fetch(url, { next: { revalidate: 60 } })`.

---

## 💡 Gotchas

- **`no-store` opts the whole *page* into dynamic rendering** — if one `fetch` in a page uses `no-store`, the entire page re-renders on every request. Hoist dynamic data to a separate route segment if possible.
- **`force-cache` is the Next.js 14 default for GET requests in Server Components** — but `fetch` in Route Handlers defaults to `no-store`. Don't assume; be explicit.
- **Cache is per-URL + per-request-headers** — two fetches to the same URL with different `Authorization` headers are cached separately.
- **`revalidatePath` vs `revalidateTag`** — path clears all data for a route; tag clears specific data across all routes. Prefer tags for precision.

---

## 🔍 Reference

- [Next.js docs: Data Fetching, Caching, and Revalidating](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating)
- [Next.js docs: revalidateTag](https://nextjs.org/docs/app/api-reference/functions/revalidateTag)
- [Next.js Explained: The 4 render modes](https://www.youtube.com/watch?v=gSSsZReIFRk)
