# Cancellable Promises with AbortController

## 🎯 Scenario

Your app has a search component that mounts, fires a fetch, then unmounts before the response arrives (the user navigated away). The fetch completes, sets state on an unmounted component, and React logs a warning. Now multiply that by 10 components with staggered timers and background polls — you have a resource leak.

Your job: build two utilities — `fetchWithSignal` and `makeAbortable` — so that any async operation can be cleanly cancelled when an `AbortSignal` fires.

---

## 📂 Files

- `boilerplate.tsx` — Two stubs: a leaky component and a `makeAbortable` shell. Edit this.
- `solution.tsx` — Both utilities fully implemented with explanations.
- `mock-api.ts` — A fake `heavyComputation` helper that respects `AbortSignal`.

---

## ❓ Why This Matters

Promises are not cancellable by design — once created, they run to completion. `AbortController` is the browser's standard mechanism to signal "stop caring" to a pending operation. It was designed for `fetch` but the pattern applies to:

- `setTimeout` / `setInterval` loops
- `ReadableStream` consumers
- Arbitrary async chains (any `await` can check the signal)
- Third-party SDKs that accept `signal` (Firebase, AWS SDK, etc.)

---

## 🧠 The AbortController API

```js
const controller = new AbortController();
const { signal } = controller;

signal.aborted;             // boolean — is it already cancelled?
signal.reason;              // the value passed to abort(), if any
signal.throwIfAborted();    // throws DOMException('AbortError') if aborted
signal.addEventListener('abort', cb);

controller.abort('reason'); // trigger cancellation
```

`fetch` accepts `signal` natively:

```js
fetch(url, { signal }); // rejects with AbortError when controller.abort() is called
```

For custom async work, check `signal.aborted` at yield points:

```js
async function work(signal) {
  for (const chunk of data) {
    signal.throwIfAborted(); // bail if cancelled
    await processChunk(chunk);
  }
}
```

---

## ✅ Tasks

### Task 1 — `fetchWithSignal`

Wrap `fetch` to automatically abort when the React component unmounts:

```ts
function fetchWithSignal<T>(url: string, signal: AbortSignal): Promise<T>
```

In `useEffect`, create a controller, pass `controller.signal`, and `abort()` on cleanup.

### Task 2 — `makeAbortable`

Wrap any `() => Promise<T>` so it respects an `AbortSignal`. If the signal fires *before* the promise resolves, reject with `AbortError`. If it fires *after*, the result is already committed — no side effects.

```ts
function makeAbortable<T>(work: () => Promise<T>, signal: AbortSignal): Promise<T>
```

### Task 3 — Combined usage

Build a component that:
1. Fires a `heavyComputation` task.
2. Shows progress while it runs.
3. Has a "Cancel" button that aborts early.
4. Correctly cleans up when it unmounts mid-computation.

### Task 4 — Bonus: `AbortSignal.any`

(Chrome 116+) Combine multiple signals so that *any* of them aborting cancels the work:

```ts
const signal = AbortSignal.any([timeoutSignal, userSignal]);
```

---

## 💡 Gotchas

- **`AbortError` is not a real error** — distinguish it from network failures with `err.name === 'AbortError'`.
- **`signal.throwIfAborted()` vs `if (signal.aborted) throw ...`** — the former is cleaner but throws before entering the function; the latter lets you run cleanup first.
- **Race between abort and resolve** — if the signal fires the exact same microtask tick as the promise resolves, the resolve wins. `makeAbortable` must handle this race safely with `Promise.race`.
- **`AbortSignal.timeout(ms)`** — a shortcut for "cancel after N milliseconds" (no controller needed).

---

## 🔍 Reference

- [MDN: AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [MDN: AbortSignal.any()](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/any_static)
- [MDN: AbortSignal.timeout()](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static)
