# Diff Two Trees

## 🎯 Scenario

You've been tasked with building a simplified version of React's reconciliation algorithm. Given two trees — the current UI tree and the next UI tree — produce a minimal list of patches: which nodes were inserted, deleted, moved, or updated. This is the foundation of every virtual DOM framework.

---

## 📂 Files

- `boilerplate.tsx` — A naive diff that ignores keys. Edit this.
- `solution.tsx` — A keyed diff that correctly handles moves and minimal insertions.
- `mock-api.ts` — Tree type definitions and helper builders.

---

## ❓ Why This Is Hard

### Without keys (naïve positional diff)

Compare children by index: child[0] with child[0], child[1] with child[1], etc.

```
Old: [A, B, C]
New: [B, C]   (A was deleted from the front)

Naïve diff:
  index 0: A → B  (UPDATE — wrong! it should be DELETE A)
  index 1: B → C  (UPDATE — wrong! it should be MOVE B)
  index 2: C → ∅  (DELETE C — wrong! C is still here)
```

Result: 3 operations, all wrong. The correct answer is just "delete A" — 1 operation.

### With keys

```
Old: [{key:'a',…}, {key:'b',…}, {key:'c',…}]
New: [{key:'b',…}, {key:'c',…}]

Keyed diff:
  'a' missing in new → DELETE
  'b' found in same position → KEEP
  'c' found in same position → KEEP
```

Result: 1 operation (delete 'a'). This is what React does.

---

## 🧠 The Algorithm

```
function diffChildren(oldChildren, newChildren):
  1. Build a Map<key, oldIndex> from oldChildren.
  2. For each child in newChildren:
     a. If found in old map → KEEP (or UPDATE if props changed).
     b. Not found → INSERT.
  3. For each child in oldChildren not seen in step 2 → DELETE.
  4. Detect moves: if a kept node's new index ≠ old index → MOVE.
```

The move detection is the trickiest part. React uses the "longest increasing subsequence" of old indices to find nodes that don't need to move — a classic O(n log n) optimisation.

---

## ✅ Tasks

### Task 1 — Type the patch

```ts
type Patch =
  | { op: 'insert'; node: TreeNode }
  | { op: 'delete'; key: string }
  | { op: 'update'; key: string; props: Record<string, unknown> }
  | { op: 'move'; key: string; toIndex: number };
```

### Task 2 — Naive diff (warm-up)

Implement positional diff first. Run the tests and see how many operations the naïve version produces vs the expected minimal set.

### Task 3 — Keyed diff

Add a `key` field to `TreeNode` and implement the keyed algorithm. All tests should pass with the minimal operation count.

### Task 4 — Recursive diff

Extend the algorithm to recurse into children — diff the subtree, not just the top-level nodes.

### Task 5 — Bonus: LIS optimisation

The move patch set can be further reduced: only nodes NOT in the longest increasing subsequence of their old indices need to move. Implement `longestIncreasingSubsequence` and use it to minimise MOVE operations.

---

## 💡 Gotchas

- **Keys must be unique siblings** — React enforces this in dev. Two siblings with the same key produce undefined diff behaviour.
- **`null` children** — components can return `null`. Treat `null` as an empty subtree.
- **Type vs key** — even if keys match, if the node *type* changes (e.g. `div` → `span`), React destroys and recreates the node (no update). Include this check.
- **The LIS trick** — moves are expensive (DOM insertBefore). You want to move the *fewest* nodes possible. Nodes already in relative order don't need to move.

---

## 🔍 Reference

- [React source: reconcileChildrenArray](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactChildFiber.js)
- [Snabbdom reconciler (clear, well-commented implementation)](https://github.com/snabbdom/snabbdom/blob/master/src/init.ts)
- [LIS algorithm — O(n log n)](https://en.wikipedia.org/wiki/Longest_increasing_subsequence)
