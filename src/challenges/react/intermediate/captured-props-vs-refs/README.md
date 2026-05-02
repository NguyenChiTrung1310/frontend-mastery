# Captured Props vs Refs — Closures in Event Handlers

## 🎯 Scenario

A chat panel receives a `user` prop (toggled externally between "Alice" and "Bob"). It has a
"Send delayed message in 3s" button. Switch to Bob, then immediately click Send. Three seconds
later the log records the message as sent by Alice — the wrong user.

This is the stale closure problem applied to event handlers: the handler closed over a prop
value that has since changed.

---

## ❓ Why This Matters

### Functional components vs class components

In class components, `this.props` is a **mutable reference** — it always points to the latest
props because `this` is shared across all method calls. Stale props in handlers are not a problem.

Functional components work differently. Every render creates a **new closure** with its own
snapshot of props and state. A handler registered in one render permanently carries that render's
values unless it is re-created.

```tsx
// Class component — always current
handleSend() {
  log(this.props.user); // reads the live mutable object
}

// Functional component — potentially stale
const handleSend = useCallback(() => {
  log(user); // frozen to the value present when this callback was created
}, []); // ← if `user` is missing from deps, this never refreshes
```

This is especially visible in:

- `setInterval` / `setTimeout` callbacks registered with empty deps
- `addEventListener` handlers wired up in `useEffect(fn, [])`
- `useCallback` with an incomplete dependency array

### The useRef bridge

`useRef` gives you a **mutable container** that persists across renders without triggering
re-renders when mutated. By keeping a ref in sync with the latest prop, callbacks can always
read the current value even when their closure is stale.

```tsx
const userRef = useRef(user);
useLayoutEffect(() => {
  userRef.current = user; // runs synchronously before paint on every render
}, [user]);

// Safe with empty deps — reads from the stable ref, not the frozen closure
const handleSend = useCallback(() => {
  setTimeout(() => log(userRef.current), 3000);
}, []);
```

`useLayoutEffect` runs synchronously before the browser paints, so the ref is always updated
before any asynchronous callback can fire.

### When NOT to use refs

Do not replace state with refs for values that drive rendering. If you read a value in JSX,
it must live in state — refs don't cause re-renders, so React won't update the DOM when they
change. Use refs only for values consumed in callbacks, effects, or timers.

---

## ✅ Tasks

1. **Reproduce the bug** — switch to Bob, click Send, wait 3 seconds. What name appears?
2. **Add a `userRef`** — create `const userRef = useRef(user)` in `ChatPanel`.
3. **Sync the ref** — add `useLayoutEffect(() => { userRef.current = user; }, [user])`.
4. **Read from the ref** — change the `setTimeout` to use `userRef.current` instead of the
   stale captured variable.
5. **Verify** — toggle to Bob, click Send — the log should now show "Bob".

---

## 💡 Gotchas

- **`useEffect` vs `useLayoutEffect` for syncing** — both work, but `useLayoutEffect` guarantees
  the ref is current before any layout-dependent code reads it. Use `useLayoutEffect` for safety.
- **Don't render refs in JSX** — `{userRef.current}` in a `return` won't update when the ref
  changes. Only state drives the DOM.
- **Empty deps become safe once you use a ref** — `useCallback(fn, [])` is correct after the fix
  because the callback no longer reads from the closure; it reads from the stable ref.
- **ESLint's `react-hooks/exhaustive-deps`** will flag the missing `user` dep in the boilerplate —
  that warning exists exactly because of this bug.

---

## 🔍 Reference

- [React docs: Referencing values with Refs](https://react.dev/learn/referencing-values-with-refs)
- [Dan Abramov: Making setInterval Declarative](https://overreacted.io/making-setinterval-declarative-with-react-hooks/)
- [React docs: useCallback — dependencies](https://react.dev/reference/react/useCallback#every-time-my-component-renders-usecallback-returns-a-different-function)
