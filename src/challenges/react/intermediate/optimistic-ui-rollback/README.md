# Optimistic UI with Rollback

## 🎯 Scenario

A blog post card has a "❤️ Like" button. In the naive implementation the button is disabled while a 1500ms server round-trip completes — the user clicks, watches a spinner, and waits before the count updates. It feels slow even on a fast connection.

Optimistic UI eliminates that wait: **update the count immediately, then sync with the server in the background**. If the server fails, restore the previous count and tell the user.

---

## ❓ Why This Matters

### The "snapshot before mutation" pattern

This is the one rule optimistic UI cannot break:

```ts
// 1. Snapshot BEFORE mutating
const previousCount = count;

// 2. Apply the optimistic update immediately
setCount(count + 1);

// 3. Fire the server call in the background
try {
  await api.likePost(id);
  // Success — nothing to do, local state is already correct
} catch {
  // 4. Rollback: restore the snapshot
  setCount(previousCount);
  showError('Like failed — please try again.');
}
```

If you forget step 1 — or snapshot AFTER the `setState` call — you lose the ability to roll back. The snapshot must capture the state **before any mutation happens**.

### When NOT to use optimistic UI

Optimistic updates are appropriate for **low-stakes, reversible actions**:

- ✅ Like / unlike, star, bookmark
- ✅ Follow / unfollow
- ✅ Reorder drag-and-drop
- ✅ Inline text edit (with conflict resolution)

They are **wrong** for:

- ❌ **Destructive actions** — deleting a post, deactivating an account. The rollback is jarring and confusing. Confirm first.
- ❌ **Financial transactions** — payments, transfers. False confirmation can cause real-world harm.
- ❌ **Actions with irreversible side effects** — sending an email, publishing a webhook.

### React 19's `useOptimistic`

React 19 formalises this pattern as a hook:

```tsx
const [optimisticCount, addOptimisticLike] = useOptimistic(
  count,
  (currentCount) => currentCount + 1,
);
```

`addOptimisticLike()` applies the optimistic update during a transition; React automatically reverts it when the transition settles. Mastering the manual snapshot pattern first makes `useOptimistic` easier to reason about — they share the same mental model.

---

## ✅ Tasks

### Task 1 — Feel the pain

Open the boilerplate. Click Like. Notice the 1.5 second wait before the count updates. The button is disabled the entire time — clicking fast is impossible.

### Task 2 — Add the optimistic update

Before calling `fakeLikePost`, snapshot `count` and increment it immediately. Move the `setCount` call above the `await`.

### Task 3 — Add rollback on failure

Wrap the API call in try/catch. On failure, restore `count` from the snapshot and surface an error message.

### Task 4 — Toggle failure mode

Add a checkbox that passes `fail: true` to `fakeLikePost`. Confirm the rollback works: the count increments optimistically, then snaps back, and the error message appears.

---

## 💡 Gotchas

- **Race condition on rapid clicks**: each click should snapshot `count` at its own call site — `const prev = count` captured via closure in the click handler, before any async gap. Using a stale ref or reading count after `setState` will give the wrong snapshot.
- **Don't disable the button during the optimistic phase** — the whole point is responsiveness. The button should only be throttled if you need to prevent duplicate operations (e.g. double-payment). For a like button, multiple in-flight requests are fine.
- **Server divergence**: if the server returns a canonical count, use that instead of local increments to avoid drift from concurrent sessions.
- **`useOptimistic` requires React 19 / Next.js 15 Server Actions** — for client-side mutations, the manual pattern shown here is still the right approach.

---

## 🔍 Reference

- [React docs: useOptimistic](https://react.dev/reference/react/useOptimistic)
- [Vercel: Optimistic UI with SWR](https://swr.vercel.app/docs/mutation#optimistic-updates)
- [TanStack Query: Optimistic updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)
