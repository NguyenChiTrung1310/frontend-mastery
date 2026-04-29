# Render Optimization with Concurrent Features

## 🎯 Scenario

You've been handed a product search component that filters a list of **10,000 items** as the user types. The implementation is the obvious one: a controlled input, `useState` for the query, `array.filter()` on every render.

It works. But typing feels horrible — the input lags, characters drop, and the page becomes unresponsive while the filter runs.

Your job: **make it feel instant** without sacrificing the real-time filter behavior.

---

## 📂 Files

- `boilerplate.tsx` — The naive implementation. Edit this.
- `solution.tsx` — The reference fix using concurrent features.
- `mock-api.ts` — Generates the 10,000-item dataset.

---

## ❓ Why Does It Lag?

React renders are **synchronous and uninterruptible** by default. When you type a character:

1. `onChange` fires and calls `setQuery(newValue)`.
2. React schedules a render.
3. During that render, the component:
   - Re-runs `items.filter(item => item.includes(query))` over 10,000 items.
   - Reconciles 10,000 list children, calling `createElement` for each.
   - Diffs the new VDOM against the previous one.
   - Commits the DOM mutations to the screen.
4. **Only then** does the browser get a chance to paint the new input value.

If steps 3a–d take longer than ~16ms, you miss a frame. On a low-end device or with a complex item renderer, each keystroke can cost 100–300ms — far past the perceptual threshold for "instant" (~100ms).

The user is **blocked on the filter computation that they don't even need to see immediately**. They need to see *their typed character* immediately. The filtered list updating a frame or two later is fine.

---

## 🧠 The Fiber Architecture Angle

React 18's Fiber reconciler can split work into chunks and yield to the browser between them — but only for **transitions**, updates explicitly marked as non-urgent. Here's the mental model:

| Update type | Behavior | API |
|---|---|---|
| **Urgent** (default) | Synchronous, blocks paint until done | `setState` |
| **Transition** | Interruptible, can be discarded if a new urgent update arrives | `startTransition`, `useTransition` |
| **Deferred value** | A "lagging" copy of a value that updates at lower priority | `useDeferredValue` |

When a transition is in flight and the user types another character:
1. The urgent input update wins — React paints the new character first.
2. The previous transition (filtering for the old query) is **thrown away**.
3. A new transition starts for the new query.

This is the magic: the input stays at 60fps no matter how expensive the list is, because the list update is allowed to be late or skipped entirely.

---

## ✅ Your Tasks

### Task 1: Diagnose

Open the boilerplate. Type quickly into the search field. Notice:
- Input lag on each keystroke.
- The list "catches up" only after you stop typing.
- Profiler shows long render commits (>50ms).

### Task 2: Apply `useDeferredValue`

Wrap the query value in `useDeferredValue` so the **filtered list** uses the deferred copy, but the **input** continues to use the immediate state.

```tsx
const deferredQuery = useDeferredValue(query);
const filtered = useMemo(
  () => items.filter(/* ... using deferredQuery */),
  [deferredQuery],
);
```

### Task 3: Show transition state

When `query !== deferredQuery`, the list is "stale". Communicate this with reduced opacity or a subtle indicator so the user knows the list is catching up.

### Task 4: Memoize the row

Even with `useDeferredValue`, every transition still re-renders all 10,000 rows. Wrap the row component in `React.memo` so unchanged rows skip the render entirely. Combined with stable keys, this brings the per-keystroke work down to ~`O(matches)` instead of `O(total)`.

---

## 💡 Bonus: When NOT to Reach for This

Concurrent features are not free:
- They add cognitive overhead — readers need to know what `useDeferredValue` does.
- They can mask real performance bugs (a slow filter algorithm is still slow, just hidden).
- For lists under ~500 items, plain `useMemo` is usually enough.

**The right order of operations is:**
1. Profile and confirm the bottleneck is rendering, not algorithmic.
2. Try `useMemo` on the expensive computation.
3. Try `React.memo` on heavy children.
4. *Then* reach for `useTransition` / `useDeferredValue` if the input itself is still janky.

---

## 🔍 Reference Reading

- [React docs: useDeferredValue](https://react.dev/reference/react/useDeferredValue)
- [React docs: useTransition](https://react.dev/reference/react/useTransition)
- [Why React Re-renders — Josh W. Comeau](https://www.joshwcomeau.com/react/why-react-re-renders/)
