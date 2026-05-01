# Stale Closure in useEffect

## 🎯 Scenario

A counter shows a number on screen. An "📣 Announce in 2s" button schedules a `setTimeout` that logs the current count to an event log after a 2-second delay. The user clicks Announce, then rapidly increments the counter 3–4 times. The announced value is always the count **at the moment of the click** — never the latest. A stale-value alert fires when the announced count doesn't match the current count, making the mismatch impossible to miss.

---

## ❓ Why This Matters

### Closures capture by value-at-creation, not by live reference

Every function in JavaScript closes over the variables visible at the time it was **created**. It does not see updates that happen later:

```js
let count = 0;
const logCount = () => console.log(count); // captures count = 0

count = 5;
logCount(); // still prints 0 — the closure holds the old value
```

Inside a React component, every render creates **new** versions of every variable. A `useEffect` callback that runs once (empty deps `[]`) captures the values from the **first render** forever — even as state updates trigger re-renders with new values.

```tsx
useEffect(() => {
  setTimeout(() => {
    console.log(count); // always 0 — stale closure
  }, 2000);
}, []); // ← runs once, captures count = 0
```

### Fix strategy 1 — Add to the deps array

Making `count` a dependency causes the effect to re-run every time `count` changes. Each re-run creates a fresh closure with the latest value. Side effect: the effect tears down and rebuilds on every count change — fine for timers, but wasteful for subscriptions.

```tsx
useEffect(() => {
  const id = setTimeout(() => log(`Count is ${count}`), 2000);
  return () => clearTimeout(id); // cleanup essential when using deps
}, [count]); // ← fresh closure every time count changes
```

### Fix strategy 2 — useRef for a live mutable reference

A `ref` is an object (`{ current: ... }`) that lives outside the render cycle. Mutating `ref.current` doesn't trigger a re-render, and reading it inside any closure always gives the **latest** value — because it's the same object reference throughout the component's lifetime.

```tsx
const countRef = useRef(count);
useEffect(() => { countRef.current = count; }, [count]); // keep ref in sync

useEffect(() => {
  setTimeout(() => log(`Count is ${countRef.current}`), 2000);
}, []); // ← runs once, but reads fresh value via ref
```

**When to prefer each:**

| Strategy | Use when |
|---|---|
| Add to deps | The effect should re-run when the value changes (timer, fetch) |
| `useRef` | The effect should run once but read live data (event listener, animation loop) |

### Connection to the exhaustive-deps ESLint rule

The `react-hooks/exhaustive-deps` rule (part of `eslint-plugin-react-hooks`) warns when a value used inside an effect is missing from its deps array. This is exactly the stale-closure bug made machine-detectable. When you see this warning, your instinct should be: "I have a stale closure — which fix strategy fits here?"

---

## ✅ Tasks

### Task 1 — Observe the bug

Click "📣 Announce in 2s", then immediately increment the counter 3 times. After 2 seconds, the log shows the count as it was when you clicked Announce — not the current count. The `🕰️ Stale Value!` alert confirms the mismatch.

### Task 2 — Fix with useRef

Add a `countRef` and keep it in sync with `count` via a separate `useEffect`. Update the `setTimeout` callback to read `countRef.current` instead of `count`.

### Task 3 — Alternatively, fix with deps

Change the `useEffect` deps from `[]` to `[count]` and observe: the effect now re-runs on each increment, always scheduling a timer with the freshest value.

---

## 💡 Gotchas

- **`useRef` mutations don't trigger renders** — updating `ref.current` is silent. That's the point: it gives you a side-channel for mutable state the render cycle doesn't need to know about.
- **The deps-array fix reschedules the timer on every increment** — if the user increments rapidly, each increment restarts the 2s countdown. Whether that's desirable depends on the use case.
- **Closures over functions too** — handlers passed as props suffer the same issue. `useCallback` + correct deps, or a ref-based stable callback, are the solutions there.
- **StrictMode double-invoke** — in React 18 dev, effects run twice. Both fixes are compatible; the ref stays correct across both runs.

---

## 🔍 Reference

- [React docs: Referencing values with refs](https://react.dev/learn/referencing-values-with-refs)
- [React docs: Removing Effect dependencies](https://react.dev/learn/removing-effect-dependencies)
- [Dan Abramov: Making setInterval Declarative](https://overreacted.io/making-setinterval-declarative-with-react-hooks/)
- [eslint-plugin-react-hooks exhaustive-deps](https://www.npmjs.com/package/eslint-plugin-react-hooks)
