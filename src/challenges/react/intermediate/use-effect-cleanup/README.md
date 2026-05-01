# useEffect Cleanup & Memory Leaks

## 🎯 Scenario

A counter component runs a `setInterval` that fires every second. A parent "Mount / Unmount" toggle controls whether the component is rendered. You mount it, watch ticks appear, unmount it — and the log **keeps growing**. The interval is still running, accumulating entries against a component that no longer exists in the tree.

This is a **memory leak**: a side effect that outlives its owner. In production, leaked timers and event listeners quietly accumulate until users report mysterious slowdowns or stale state bugs that are nearly impossible to reproduce.

---

## ❓ Why This Matters

Every `useEffect` that sets up a timer, subscription, or event listener must return a **cleanup function**. Without it the side effect outlives the component:

- Timers keep firing and calling `setState` on an unmounted component
- Event listeners respond to events no component cares about any more
- In React 18 Strict Mode, effects deliberately **double-mount** in development — any leak surfaces immediately as doubled ticks or doubled event responses

The mental model:
> Cleanup = **"undo what this effect did"**

If the effect called `addEventListener`, cleanup calls `removeEventListener`.  
If the effect called `setInterval`, cleanup calls `clearInterval`.

Critically: **cleanup also runs between renders when deps change** — not just on unmount. Every time a dep changes, React runs cleanup for the previous render's effect before running the next effect. This is why stale subscriptions to the old value are always torn down.

---

## ✅ Tasks

### Task 1 — Observe the leak

Mount the component. Watch ticks appear in the log. Click "Unmount". The log should freeze — but it keeps growing. A `⚠️ Leak Active` badge lights up.

### Task 2 — Return a cleanup function

In the `useEffect` inside the counter, save the return value of `setInterval` and return a cleanup function:

```ts
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id); // ← add this
}, []);
```

After this fix, unmounting the component immediately freezes the log.

### Task 3 — Verify in StrictMode

React 18 Strict Mode (enabled by default in `next.js dev`) mounts → unmounts → remounts every component. Without the cleanup, you'll see doubled tick rates. With it, the second mount starts a clean interval.

---

## 💡 Gotchas

- **The React dev warning** you'll see in the console without a cleanup:
  ```
  Warning: Can't perform a React state update on an unmounted component.
  This is a no-op, but it indicates a memory leak in your application.
  ```
  (React 18 removed this specific warning but StrictMode double-mount still surfaces the bug via doubled tick rate.)

- **Cleanup runs on dep changes too** — if your effect deps include a value that changes frequently, the cleanup runs every time, not just on unmount. Plan for it.

- **Async effects can't return a Promise** — a `useEffect` cleanup must be a synchronous function or `undefined`. If your effect is `async`, you need an `isCancelled` flag pattern:
  ```ts
  useEffect(() => {
    let cancelled = false;
    fetchData().then(data => { if (!cancelled) setData(data); });
    return () => { cancelled = true; };
  }, []);
  ```
  You cannot `return async () => { ... }` from `useEffect`.

---

## 🔍 Reference

- [React docs: Synchronizing with Effects — cleanup](https://react.dev/learn/synchronizing-with-effects#how-to-handle-the-effect-firing-twice-in-development)
- [React docs: You might not need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- [MDN: setInterval / clearInterval](https://developer.mozilla.org/en-US/docs/Web/API/setInterval)
