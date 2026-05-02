# SSR-Safe useLocalStorage Hook

## 🎯 Scenario

A theme-preference component uses a `useLocalStorage` hook that calls
`localStorage.getItem()` as a direct argument to `useState`. In the browser this works fine.
Deploy to Next.js with SSR and the server crashes: `ReferenceError: localStorage is not
defined`. Fix the crash and you introduce the second bug: the server renders `"light"` (the
default), the client hydrates with `"dark"` (from storage), and React warns about a content
mismatch that can break hydration and hurt SEO.

---

## ❓ Why This Matters

### Why the lazy initializer is the correct pattern

`useState(expr)` evaluates `expr` on **every render** as a JavaScript argument, even though
React only uses the value on the first render. When `expr` is `localStorage.getItem(key)`,
that's an unnecessary DOM read every re-render — and a fatal crash on the server.

The **lazy initializer** form, `useState(() => expr)`, passes a function. React calls that
function **once**, on the first render, and discards subsequent returns. Wrapping the
localStorage access in this function makes it lazy and gives you one place to add the SSR
guard:

```tsx
const [value, setValue] = useState(() => {
  if (typeof window === 'undefined') return defaultValue; // SSR: no localStorage
  const stored = localStorage.getItem(key);
  return stored ?? defaultValue;
});
```

This eliminates the crash and the unnecessary re-render reads in a single change.

### The hydration mismatch problem

Even with the crash fixed, there's a subtler issue. Next.js:

1. Runs the component on the **server** → `typeof window === 'undefined'` is `true` →
   `useState` initializes with `defaultValue` → HTML sent to browser says `"light"`.
2. Browser downloads the HTML and the JavaScript bundle.
3. React **hydrates** the existing HTML: runs the component again and compares the output
   to the server HTML.
4. If `localStorage.getItem(key)` returns `"dark"`, the client-side render produces `"dark"`.
5. Server said `"light"`, client says `"dark"` → **hydration mismatch** → React warns, and
   in some cases discards the server HTML entirely and re-renders from scratch. This hurts
   Time-to-Interactive and can cause a flash of wrong content.

### The useEffect post-hydration sync pattern

The fully correct solution starts with `defaultValue` on both server and client
(matching — no mismatch), then reads from `localStorage` inside `useEffect` which runs only
after React has finished hydrating:

```tsx
const [value, setValue] = useState(defaultValue); // server and client agree

useEffect(() => {
  // Safe: runs only in the browser, after hydration is complete
  const stored = localStorage.getItem(key);
  if (stored !== null) setValue(stored as T);
}, [key]);
```

Tradeoff: there is a brief flash of `defaultValue` before the stored value loads. For most
preferences (theme, language) this is acceptable. For critical data, render a loading
skeleton until the effect fires.

### Cross-tab sync (bonus)

The `storage` event fires in all other tabs when localStorage changes. Add a listener to
keep tabs in sync without polling:

```tsx
useEffect(() => {
  function onStorage(e: StorageEvent) {
    if (e.key === key && e.newValue !== null) {
      setValue(e.newValue as T);
    }
  }
  window.addEventListener('storage', onStorage);
  return () => window.removeEventListener('storage', onStorage);
}, [key]);
```

---

## ✅ Tasks

1. **See the bugs** — observe the SSR error simulation and hydration mismatch panels.
2. **Fix the crash** — add `typeof window === 'undefined'` guard inside the lazy initializer.
3. **Fix the mismatch** — start with `useState(defaultValue)` and sync in `useEffect`.
4. **Bonus** — add a `storage` event listener for cross-tab synchronization.

---

## 💡 Gotchas

- **`typeof window` not `window === undefined`** — accessing an undeclared variable in strict
  mode throws a `ReferenceError`. `typeof window` is always safe even when `window` doesn't
  exist.
- **JSON.parse can throw** — wrap your storage read in try/catch; corrupted or third-party
  values can break `JSON.parse`.
- **The lazy init function runs twice in StrictMode** — React intentionally double-invokes it
  in dev to detect side effects. Your guard handles this correctly.
- **`useEffect` runs AFTER React commits** — this means there will always be one render with
  `defaultValue` before the stored value loads. Use a loading state if the flash is
  unacceptable for your UI.

---

## 🔍 Reference

- [React docs: useState lazy initialization](https://react.dev/reference/react/useState#avoiding-recreating-the-initial-state)
- [React docs: Hydration](https://react.dev/reference/react-dom/client/hydrateRoot)
- [MDN: Window: storage event](https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event)
