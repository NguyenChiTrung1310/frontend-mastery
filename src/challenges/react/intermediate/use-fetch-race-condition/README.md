# Race-Safe useFetch Hook

## 🎯 Scenario

You're building a live search box. Every time the user types a character, you fire a new fetch. On a slow connection — or a mocked API with variable latency — the request for "re" might resolve *after* the request for "react". Your screen then shows stale results for "re" even though the user already typed more.

This is the **stale closure / race condition** bug. It's the most common async mistake in React apps, and it silently corrupts UI state.

---

## 📂 Files

- `boilerplate.tsx` — A `useFetch` hook that does not cancel stale requests. Edit this.
- `solution.tsx` — Race-safe implementation using `AbortController`.
- `mock-api.ts` — A mock search function that intentionally jitters response times to surface the race.

---

## ❓ Why This Matters

Every `useEffect` that starts async work and updates state after an `await` is a potential race:

```
User types "r"  → fetch A starts (200ms latency)
User types "re" → fetch B starts (50ms latency)
fetch B resolves → setData(results for "re")   ✓
fetch A resolves → setData(results for "r")    ✗ stale!
```

The browser has no built-in mechanism to cancel in-flight fetches when a new one starts. You must implement that cancellation yourself.

---

## ✅ Tasks

### Task 1 — Reproduce the bug

Run the boilerplate. Type "react" quickly into the search box. Watch the results panel flicker between different result sets as stale responses land out of order. Open the console — you'll see requests arriving out of order.

### Task 2 — Fix with an ignore flag

The simplest fix: a boolean `ignored` flag that the cleanup function sets to `true`. When the response arrives, check `if (ignored) return` before calling `setData`.

```ts
useEffect(() => {
  let ignored = false;
  fetchSearchResults(query).then((data) => {
    if (!ignored) setData(data);
  });
  return () => { ignored = true; };
}, [query]);
```

This stops stale data from landing but **does not cancel the network request** — the fetch still completes, you just throw the result away.

### Task 3 — Level up: cancel with AbortController

`AbortController` actually cancels the underlying network request. Pass `signal` to `fetch()` and abort in the cleanup:

```ts
useEffect(() => {
  const controller = new AbortController();
  fetch(url, { signal: controller.signal }).then(...);
  return () => controller.abort();
}, [query]);
```

When you `abort()`, the fetch rejects with an `AbortError`. Distinguish it from real errors:

```ts
.catch((err) => {
  if (err instanceof Error && err.name === 'AbortError') return; // expected
  setError(err);
});
```

### Task 4 — Wrap into a reusable `useFetch` hook

Move the abort logic into a custom hook so any component can get race-safe fetching in 3 lines.

---

## 💡 Gotchas

- **Don't forget to handle `AbortError`** — it's not a real error, just a signal that the request was superseded.
- **`ignored` flag vs `AbortController`** — the flag is simpler but still burns bandwidth. `AbortController` is strictly better for cancelable operations like `fetch`.
- **`useEffect` runs twice in Strict Mode** — if your hook isn't race-safe you'll see double fires even with a stable `query`.
- **MSW intercepts `AbortController` correctly** — the mock server in this challenge does, too.

---

## 🔍 Reference

- [React docs: You might not need an effect (fetching data)](https://react.dev/learn/you-might-not-need-an-effect#fetching-data)
- [MDN: AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [React Query source — cancellation pattern](https://github.com/TanStack/query)
