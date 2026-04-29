# Implement Debounce & Throttle

## 🎯 Scenario

Two of the most common rate-limiting utilities in JS. Most devs use `lodash.debounce` without ever thinking about *how* it works. Time to fix that.

## 🧠 The Distinction

- **Debounce**: "Wait until things calm down, then run." Ideal for search-as-you-type.
- **Throttle**: "Run at most every X ms, even if called nonstop." Ideal for scroll/resize handlers.

The bug most juniors hit is conflating the two — using debounce on a scroll handler means the callback never fires until the user stops scrolling, which is usually *not* what you want.

## ✅ Tasks

1. Implement `debounce<T extends (...args: any[]) => unknown>(fn: T, wait: number): T`.
2. Implement `throttle<T extends (...args: any[]) => unknown>(fn: T, wait: number): T`.
3. Both should preserve `this` and forward args correctly.
4. Bonus: Add a `cancel()` method on the returned function.

## 💡 Gotchas

- **Closure over the timer ID** is the heart of debounce. Don't recreate it.
- For throttle: decide between *leading-edge* (fires immediately, then locks out) and *trailing-edge* (waits the interval, then fires). Lodash supports both via options. Pick one for now and document it.
- `setTimeout` returns different types on Node vs browser — type it as `ReturnType<typeof setTimeout>`.

Open the **Console** panel below to see your output as you call the functions.
