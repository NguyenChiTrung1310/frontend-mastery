# Promise Pool with Concurrency Limit

## 🎯 Scenario

You have 50 image URLs to upload to S3. If you fire all 50 `fetch` calls at once, you'll hit rate limits, exhaust the browser's 6-connections-per-host cap, and likely OOM the server. You need to run *at most K tasks in parallel* and start the next one as soon as a slot opens — like a worker pool in any traditional language.

---

## 📂 Files

- `boilerplate.tsx` — An interactive task runner with a stub `promisePool` that runs everything at once. Edit this.
- `solution.tsx` — A reference implementation with two approaches.
- `mock-api.ts` — Fake task factory with configurable delay and failure rate.

---

## ❓ Why This Matters

Naive `Promise.all(tasks.map(runTask))` offers zero backpressure. When `tasks` is large:

- All 50 fetches hit the network simultaneously.
- Browser queues the extras, introducing head-of-line blocking.
- Server gets hammered, responses stall, you hit rate limits.

A **promise pool** keeps exactly K tasks running at all times. When one task finishes, the next one immediately starts — maximising throughput without overload.

This pattern appears everywhere:
- Batch uploads / downloads
- Rate-limited API calls (e.g. 10 req/s limits)
- Database bulk inserts with connection pool constraints
- Web crawlers respecting politeness limits

---

## 🧠 The Algorithm

**Recursive slot-fill approach:**

```js
async function promisePool(tasks, concurrency) {
  const results = [];
  let i = 0;

  async function runNext() {
    if (i >= tasks.length) return;
    const index = i++;
    results[index] = await tasks[index]();
    await runNext(); // fill the freed slot immediately
  }

  // Kick off `concurrency` workers in parallel
  await Promise.all(Array.from({ length: concurrency }, runNext));
  return results;
}
```

Each "worker" is a recursive async function that grabs the next task index and loops until there are none left. `Promise.all` on K workers gives you exactly K concurrent tasks.

---

## ✅ Tasks

### Task 1 — Fix the stub

The boilerplate's `promisePool` runs all tasks at once (no limit). Make it respect `concurrency`.

```ts
async function promisePool<T>(
  tasks: Array<() => Promise<T>>,
  concurrency: number,
): Promise<T[]>
```

### Task 2 — Verify with the UI

Increase concurrency from 1 → 3 → 10 and watch the timeline. With concurrency 1, tasks run strictly sequentially. With concurrency 3, three "in-flight" badges show at once.

### Task 3 — Handle partial failures

Some tasks in the UI fail randomly. Make your pool collect results and errors separately — don't let one failure abort everything (that's `Promise.allSettled` semantics, applied per slot).

### Task 4 — Bonus: `asyncMap`

Wrap `promisePool` into an `asyncMap(items, asyncFn, concurrency)` utility that mirrors `Array.prototype.map` but with a concurrency cap.

---

## 💡 Gotchas

- **Index capture** — increment the counter *before* `await`, not after. If two workers read the same `i` before either increments it, they run the same task twice.
- **Error isolation** — if you `await tasks[i]()` without a try/catch, a failure propagates up through `runNext` and kills that worker slot permanently. Wrap in try/catch.
- **`Array.from({ length: n }, fn)` vs a for loop** — the `from` version initialises all K worker promises in a single synchronous tick, which is important so they all start racing correctly.

---

## 🔍 Reference

- [MDN: Promise.all](https://developer.mozilla.org/en-US/docs/Web/API/Promise/all)
- [MDN: Promise.allSettled](https://developer.mozilla.org/en-US/docs/Web/API/Promise/allSettled)
- [p-limit source — battle-tested production version](https://github.com/sindresorhus/p-limit)
