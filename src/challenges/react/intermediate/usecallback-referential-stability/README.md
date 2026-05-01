# useCallback & Referential Stability

## 🎯 Scenario

A parent component has an unrelated counter and renders 8 child `Row` components,
each wrapped in `React.memo`. An inline click handler is passed to every Row as a prop.

Clicking "Increment" should only cause the parent to re-render — the list data didn't
change, so all Rows should be skipped. Instead, all 8 Rows re-render every single time.
React.memo is doing nothing. The render log fills with wasted work.

---

## ❓ Why This Matters

### Referential equality vs value equality

In JavaScript, primitives (`string`, `number`, `boolean`) are compared by **value**:

```js
'hello' === 'hello'  // true
42 === 42            // true
```

Objects and functions are compared by **reference** — their identity in memory:

```js
{} === {}              // false — two different objects
(() => {}) === (() => {}) // false — two different functions
```

This means every time a component renders, any function defined inline is a **brand-new
function object**, even if the body is identical to the last render.

### The React.memo + useCallback co-dependency

`React.memo` wraps a component and memoizes it: before re-rendering, React shallowly
compares each prop to its previous value using `Object.is`. If all props are the same,
the render is skipped.

The problem: if a parent passes an inline handler —

```tsx
<Row onClick={() => handleClick(item.id)} />
```

— the arrow function is a **new object every render**. `Object.is(prevOnClick, nextOnClick)`
is always `false`. React.memo's comparison fails, and the Row re-renders unconditionally.
You've paid the cost of wrapping in memo for zero benefit.

`useCallback` solves this by memoizing the function reference:

```tsx
const handleClick = useCallback((id: number) => {
  setSelected(id);
}, []); // deps: empty — setSelected is stable, no other captured values
```

Now the same function object is returned on every render. `React.memo`'s check passes.

**Critical prerequisite**: both halves must be present.

| Setup | Result |
|---|---|
| Inline handler + no memo | Re-renders (baseline — also worst case) |
| useCallback + no memo | Still re-renders (memo isn't there to stop it) |
| Inline handler + React.memo | Still re-renders (memo check always fails) |
| **useCallback + React.memo** | **Skips re-renders ✅** |

---

## ✅ Tasks

### Task 1 — Observe the bug

Click "Increment counter" several times. Watch the render log: every click produces
a parent re-render entry **and** 8 Row re-render entries. The "Wasted renders" badge
climbs by 8 per click. The Row render count badges (shown inline) all increment.

The list data never changed. This work is wasted.

### Task 2 — Fix with useCallback

Wrap `handleClick` in `useCallback` with the correct dependency array:

```tsx
const handleClick = useCallback((id: number) => {
  setSelected(id);
}, []);
```

Now clicking "Increment" should only produce a single parent entry in the log.
The Row render count badges should stay at `1` forever.

### Task 3 — Verify the prerequisite

Temporarily remove `React.memo` from `Row`. Does useCallback still help? (Spoiler: no.)
The `solution.tsx` has a live "Wrong Pattern" panel that demonstrates this.

### Task 4 — Audit the dependency array

Add a `multiplier` state to the parent. Change `handleClick` to apply the multiplier.
What does the dependency array need now? What happens if you leave `[]`?

---

## 💡 Gotchas

- **Empty deps `[]` is not always correct.** If the callback closes over any state or prop
  that can change, it must be in the array — otherwise the closure is stale. A stale callback
  still works (same function, no re-renders) but reads old values. In Task 4 above, leaving
  `[]` while closing over `multiplier` is a stale closure bug.

- **useCallback memoizes, not caches.** When a dependency changes, `useCallback` discards
  the old function and creates a new one. Any children receiving it via props will re-render
  on that tick. This is correct and expected — the function legitimately changed.

- **Don't cargo-cult useCallback.** Wrapping every function in `useCallback` is an antipattern:
  - It adds memory overhead (the memoized function must be retained)
  - It adds cognitive overhead (you must reason about the dependency array)
  - It only helps when the consumer is wrapped in `React.memo` (or is a hook dependency)
  
  Always measure first. React DevTools Profiler and the `why-did-you-render` library show
  whether a component is actually re-rendering unnecessarily before you add memoization.

- **Stable state setters.** React guarantees that `setState` functions (the setter returned
  by `useState`) are stable across renders. You don't need to list them in `useCallback`'s
  dependency array — they will never trigger a new function to be created.

---

## 🔍 Reference

- [React docs: useCallback](https://react.dev/reference/react/useCallback)
- [React docs: memo](https://react.dev/reference/react/memo)
- [React docs: When to add memo](https://react.dev/reference/react/memo#should-you-add-memo-everywhere)
- [why-did-you-render — profiling tool](https://github.com/welldone-software/why-did-you-render)
