# Virtualized List from Scratch

## 🎯 Scenario

You're rendering a list of **10,000 items**. The naive implementation mounts all 10,000 `<div>` nodes
into the DOM simultaneously. Scrolling is janky, the initial paint is slow, and DevTools shows
thousands of layout thrashes per second.

Your job: build a `useVirtualizer` hook that renders **only the rows currently in the viewport**
plus a small overscan buffer — no external library, pure math.

---

## ❓ Why This Matters

The browser must **layout, paint, and composite every DOM node** — even ones that are completely
off-screen. With 10,000 items at 64px each, the scroll container is 640,000px tall and the browser
is managing the geometry of all 10,000 elements on every scroll event.

Virtualization (a.k.a. windowing) trades DOM node count for arithmetic:

```
startIndex = Math.floor(scrollTop / itemHeight)
endIndex   = Math.ceil((scrollTop + containerHeight) / itemHeight)
visible    = endIndex - startIndex   ≈ containerHeight / itemHeight
```

For a 512px container and 64px items, that's ~8 visible rows. With an overscan of 3 above and
below, you render **~14 DOM nodes** instead of 10,000.

---

## 🧠 The Windowing Math

### Core formula

```
startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
endIndex   = Math.min(count - 1, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan)
totalHeight = count * itemHeight
offsetTop[i] = i * itemHeight
```

### Why `position: absolute` (not margin-top tricks)

Each rendered row needs to appear at the **correct vertical position** in the scroll container,
even though only a fraction of rows exist in the DOM.

With `position: absolute; top: offsetTop`, you can place row `i` at pixel `i * itemHeight`
without needing any sibling rows above it. The container gets a single spacer child
(`height: totalHeight`) that maintains the correct scrollbar size.

Margin-top tricks work in simple cases but break down when items are removed/added dynamically
because every row's margin accumulates from its predecessor — a costly O(n) recalculation.

### The spacer pattern

```
<div style={{ height: containerHeight, overflow: 'auto' }} ref={containerRef} onScroll={...}>
  <div style={{ height: totalHeight, position: 'relative' }}>
    {virtualItems.map(v => (
      <Row style={{ position: 'absolute', top: v.offsetTop, height: itemHeight }} />
    ))}
  </div>
</div>
```

The outer div is the viewport (fixed height, scrollable). The inner div is the "runway" — it
establishes the correct scroll height. Rows float within the runway at absolute positions.

---

## ✅ Tasks

### Task 1 — Observe the problem

Open the boilerplate. Click **Measure** and watch the FPS meter plummet. Note the DOM node count badge.

### Task 2 — Implement `useVirtualizer`

```ts
interface VirtualizerOptions {
  count: number;
  itemHeight: number;
  containerHeight: number;
}
interface VirtualItem {
  index: number;
  offsetTop: number;
}
interface VirtualizerResult {
  virtualItems: VirtualItem[];
  totalHeight: number;
}
```

- Track `scrollTop` via an `onScroll` handler on the container ref.
- Calculate `startIndex` and `endIndex` from the formula above (include overscan of 3).
- Return `virtualItems` (the slice of items to render) and `totalHeight` (the runway height).

### Task 3 — Wire up the DOM structure

Replace the naive render with the spacer + absolute-positioned rows pattern.

### Task 4 — Verify

After your fix, the DOM Node Count badge should read **~15–20 nodes**. The FPS meter should stay
above 55 fps during the programmatic scroll.

---

## 💡 Gotchas

- **Don't forget the overscan.** Without it, fast scrolls on low-end devices reveal a flash of
  empty space while React catches up to the new scroll position.
- **The container must have a fixed, known height.** `useVirtualizer` needs `containerHeight` as
  a number — you can't pass `100%` and expect math to work. Use a ref + `ResizeObserver` if you
  need truly responsive heights (out of scope here; hardcode 512px).
- **Keys matter.** Use `v.index` as the React key, not `v.offsetTop` — keys must be stable across
  re-renders even when `offsetTop` changes.
- **`noUncheckedIndexedAccess`** is on. `items[v.index]` is `Item | undefined` — guard it.

---

## 🔍 When to use a library instead

Roll your own `useVirtualizer` when:
- You're in a highly constrained bundle (no room for `@tanstack/react-virtual`)
- You need custom behaviour the library doesn't support
- You're learning (this challenge!)

Use `@tanstack/react-virtual` in production because:
- It handles variable-height items (the hard follow-up problem)
- It handles horizontal virtualization
- It handles `ResizeObserver`-based dynamic container heights
- It's battle-tested across browsers and edge cases

### Variable-height items — the hard follow-up

When items have different heights, `offsetTop[i]` is no longer `i * itemHeight`. You need a
`measureElement` callback that records each row's measured height and caches it, plus a prefix-sum
array to efficiently compute `offsetTop[i] = sum(heights[0..i-1])`. This is what makes libraries
like `@tanstack/react-virtual` genuinely difficult to replicate correctly.

---

## 🔍 Reference Reading

- [MDN: position: absolute](https://developer.mozilla.org/en-US/docs/Web/CSS/position)
- [@tanstack/react-virtual docs](https://tanstack.com/virtual/latest)
- [Lin Clark: A Cartoon Intro to Fiber](https://www.youtube.com/watch?v=ZCuYPiUIONs) — not directly
  related but explains why concurrent React + long lists is still a layered problem
