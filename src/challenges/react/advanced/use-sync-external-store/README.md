# Subscribe to Browser APIs with useSyncExternalStore

## 🎯 Scenario

Your dashboard shows a "network status" badge, a responsive layout that changes at a breakpoint, and a live window-size readout. Each of these needs to react to browser events (`online`/`offline`, `matchMedia`, `resize`) and update React state.

The naive approach — `useState` + `useEffect` — works in most cases but has two subtle problems in React 18 concurrent mode. Your job: rewrite each subscription using `useSyncExternalStore` to fix them.

---

## 📂 Files

- `boilerplate.tsx` — Three hooks using the `useState`/`useEffect` pattern. Edit this.
- `solution.tsx` — Same three hooks rewritten with `useSyncExternalStore`.
- `mock-api.ts` — No mock needed; this challenge uses real browser APIs.

---

## ❓ Why This Matters

### Problem 1: Tearing

In concurrent mode, React can render a component tree across multiple frames. If your external store changes between two renders of the same tree, sibling components may read *different snapshots* of the same value. The result is a torn UI — e.g., one part of the page shows "online" while another shows "offline" for the same state update.

`useSyncExternalStore` guarantees that all components subscribing to the same store see the same snapshot within a single render pass.

### Problem 2: Missing the initial value on the server

`useState` initializer and `useEffect` never run on the server. If a `useState`-based hook is used in a Server Component tree (or SSR), it starts with `undefined` and hydrates with the real value — causing a hydration mismatch.

`useSyncExternalStore` accepts a `getServerSnapshot` argument that returns a safe fallback for SSR.

---

## 🧠 The API

```ts
const value = useSyncExternalStore(
  subscribe,        // (callback) => unsubscribe — called once on mount
  getSnapshot,      // () => currentValue — called on every render
  getServerSnapshot // () => ssrValue — optional, for SSR
);
```

The contract:
- `subscribe` must call `callback` whenever the external value changes.
- `getSnapshot` must be **pure and fast** — React calls it on every render to check if it changed.
- If `getSnapshot` returns a different value than the previous call, React re-renders the component.

---

## ✅ Tasks

### Task 1 — `useOnlineStatus`

Replace the `useState`/`useEffect` version with `useSyncExternalStore`.

```ts
subscribe: (cb) => { window.addEventListener('online', cb); window.addEventListener('offline', cb); ... }
getSnapshot: () => navigator.onLine
getServerSnapshot: () => true // assume online during SSR
```

### Task 2 — `useWindowWidth`

Same pattern for `window.innerWidth`. Be careful: `getSnapshot` is called *very frequently* — return a number, not an object.

### Task 3 — `useMediaQuery`

Track a `matchMedia` query string. Note: `matchMedia` doesn't exist on the server — guard with `typeof window !== 'undefined'`.

### Task 4 — Bonus: `useLocalStorage`

Create a `useLocalStorage(key, defaultValue)` hook that subscribes to changes from other tabs via the `"storage"` event.

---

## 💡 Gotchas

- **`getSnapshot` must be referentially stable or return a primitive** — returning a new object `{}` every time will cause infinite re-renders. Always return a primitive or cache the object.
- **`subscribe` must return the unsubscribe function** — not `void`. If you forget the return, you'll leak event listeners.
- **`matchMedia` is not available in Node.js** — always guard with `typeof window !== 'undefined'` for server snapshots.
- **`resize` fires continuously** — for `useWindowWidth` you may want to throttle the snapshot read with `Math.round` to the nearest 10px to reduce re-renders.

---

## 🔍 Reference

- [React docs: useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore)
- [React 18 Working Group: useMutableSource → useSyncExternalStore](https://github.com/reactwg/react-18/discussions/86)
- [Tearing in concurrent React — visual explainer](https://github.com/reactwg/react-18/discussions/69)
