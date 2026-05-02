# Context Re-render Performance Problem

## 🎯 Scenario

A `StoreContext` bundles `count`, `theme`, `increment`, and `toggleTheme` into one value.
Three consumer components — `Counter`, `ThemeDisplay`, and `ActionButtons` — each subscribe
to it via `useContext`. Click Increment once: all three re-render. ThemeDisplay just displayed
`☀️ light` again for no reason. ActionButtons just re-rendered the buttons you just clicked.
Neither needed to re-render — they didn't consume `count`.

---

## ❓ Why This Matters

### What useContext actually does

`useContext(MyContext)` subscribes the component to the nearest provider's `value` prop.
React compares the current value to the previous using **`Object.is`** (referential equality).
When they differ, every subscribed component re-renders — unconditionally. React does not look
at which fields you destructure; it only cares whether the value object changed.

```tsx
// This fires every subscriber on every render of the provider
const value = { count, theme, increment, toggleTheme }; // new object reference every time
```

### Why context is not a performance-first solution

Context solves **prop drilling**, not **reactivity granularity**. It has no selector mechanism
(`connect(state => state.count)` like Redux), no atom-level subscriptions like Jotai or Zustand,
and no structural equality check like Immer. If you need fine-grained subscriptions across many
components, reach for a dedicated state library instead.

```
React Context  → whole value or nothing
Zustand        → selector-level subscriptions
Jotai          → atom-level (each piece is its own context)
Redux          → selector + structural equality (reselect)
```

### The split-context pattern

The canonical fix is to separate values by **update frequency**:

```tsx
// Data that changes often
const CountContext = createContext<{ count: number } | null>(null);
const ThemeContext = createContext<{ theme: 'light' | 'dark' } | null>(null);

// Actions that never change (stable callbacks)
const ActionsContext = createContext<{ increment: () => void; toggleTheme: () => void } | null>(null);
```

A component that only calls `useContext(ActionsContext)` never re-renders from count or
theme changes, because `ActionsContext`'s value object never changes reference
(its contents are stable `useCallback`s).

### The useMemo(value, [deps]) pattern — and its limits

A lighter-weight fix is to memoize the context value object:

```tsx
const value = useMemo(
  () => ({ count, theme, increment, toggleTheme }),
  [count, theme, increment, toggleTheme],
);
```

This prevents spurious re-renders caused by parent components, but does NOT help if
`count` and `theme` are in the same object — a count change still re-renders
ThemeDisplay because the memoized object changes whenever any dep changes.
For true isolation, split the context.

---

## ✅ Tasks

1. **Observe the waste** — click +1 Count several times. Watch all three render counts climb.
   ThemeDisplay and ActionButtons should have stayed at 1.
2. **Split the context** — define `CountContext`, `ThemeContext`, and `ActionsContext`.
3. **Stable action refs** — wrap `increment` and `toggleTheme` in `useCallback(fn, [])`.
4. **Memoize each value** — use `useMemo` for each context value object.
5. **Update consumers** — `Counter` reads `CountContext`, `ThemeDisplay` reads `ThemeContext`,
   `ActionButtons` reads `ActionsContext`.
6. **Verify** — clicking +1 Count should only re-render Counter.

---

## 💡 Gotchas

- **useMemo is not free**: it adds memory overhead and a dependency comparison. Only apply
  it when the memoization actually prevents downstream work.
- **Stable callbacks are required for ActionsContext**: `useCallback(fn, [])` gives increment
  and toggleTheme stable references. Without it, ActionsContext's value changes every render
  and busts the optimization.
- **Nested providers still cause re-renders if not memoized**: wrapping value in `useMemo` is
  required even after splitting — otherwise a parent re-render creates a new value object.
- **React DevTools Profiler** is the gold-standard tool for measuring this in production apps.
  Enable the "Highlight updates" option to see which components flash on each interaction.

---

## 🔍 Reference

- [React docs: Scaling up with Reducer and Context](https://react.dev/learn/scaling-up-with-reducer-and-context)
- [React docs: Optimizing re-renders with context](https://react.dev/reference/react/useContext#optimizing-re-renders-when-a-context-changes)
- [Daishi Kato: Why I built Jotai](https://blog.logrocket.com/jotai-vs-recoil-what-are-the-differences/) (the limits of context)
