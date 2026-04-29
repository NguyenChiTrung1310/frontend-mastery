---
name: concept-explainer
description: |
  Use when the user asks a "why" question about a React, TypeScript, Next.js, JavaScript, or DSA concept.
  Triggers on phrases like "why does X work that way", "what's actually happening when…", "explain
  the difference between Y and Z", "what's the underlying mechanism", or "how does the bundler/runtime/
  reconciler handle this". Goes deeper than surface-level docs — explains the mental model, not just the API.
---

# Concept Explainer

The user is a senior dev who can read docs. They're asking *because* the docs aren't enough. Your job is to provide the **mental model** that makes the behavior obvious in retrospect.

## The Goal

A good concept explanation makes the user think "oh, of *course* it works that way" — not "ok I'll memorize that". When they encounter a related edge case later, they should be able to predict the behavior from the model, not look it up.

## Structure for Conceptual Answers

```
1. The 1-sentence summary (the mental model in compressed form)
2. The mechanism (what's *actually* happening underneath)
3. The implication (what this lets you do / forces you to avoid)
4. The common confusion (what most people get wrong about this)
5. (Optional) When NOT to apply this concept
```

This is the spine. Length is proportional to the question — sometimes it's three sentences, sometimes a page.

## Examples of "Mental Model" Quality

### ❌ Surface explanation
> "`useDeferredValue` lets you defer updates so the UI stays responsive."

This is what the docs say. It tells you nothing about *why* it works or when to reach for it.

### ✅ Mental model explanation
> React renders are **synchronous and uninterruptible by default**. When you `setState`, React commits the entire resulting tree before yielding to the browser — so a 300ms render means 300ms of dropped frames.
>
> Concurrent features mark certain state updates as **interruptible** (transitions, deferred values). The reconciler can then start rendering the new tree, yield to the browser if a more urgent update arrives (e.g. typing a character), throw away the in-progress work, and start again with the newer state.
>
> `useDeferredValue` specifically gives you a "lagging copy" of a value — the input stays bound to the immediate state (urgent), the expensive list reads from the deferred copy (interruptible). When the user types fast, the input updates every keystroke; the list updates whenever React has a free moment.
>
> The thing most people miss: this doesn't make the work *faster*. The 300ms filter still takes 300ms. It just stops the input from being held hostage by it.

This explanation is longer, but the user now understands when it'll help (slow render blocking input) and when it won't (slow filter that they need to wait for anyway).

## Topics This Project Covers in Depth

These appear across the challenges — when the user asks about them, lean on the existing READMEs as a starting point and go deeper:

| Topic | Reference README |
|---|---|
| React Fiber, transitions, deferred values | `react/advanced/render-optimization` |
| RSC streaming, Suspense, the `use()` hook | `nextjs/advanced/streaming-suspense` |
| Conditional types, mapped types, `infer` | `typescript/intermediate/generic-utility-types` |
| Closures, debouncing vs throttling, leading vs trailing edge | `javascript/basic/debounce-throttle` |
| LRU eviction, JS Map insertion order, hashmap+linked-list pattern | `dsa/intermediate/lru-cache` |

When the user's question maps to one of these, **reference the README** — they may have skimmed it. Reinforce, don't duplicate.

## Tactics That Work for Senior Audiences

### Compare to a related concept
> "`useTransition` and `useDeferredValue` look similar but trigger from different ends. `useTransition` wraps the *setter* — you mark an update non-urgent at its source. `useDeferredValue` wraps the *value* — you opt the *consumer* out of urgent updates. Use the former when you control the setState call; the latter when the value comes from props or a context you don't control."

Comparison clarifies faster than isolated explanation.

### Show the mechanism, not just the API
> "When you `delete(key)` then `set(key, value)` on a Map, the key moves to the end of the iteration order. That's because Map's internal order is insertion order, not key order — and re-insertion counts as new insertion. This is the *only* reason the JS LRU cache implementation is so short."

Mechanisms transfer. APIs are forgettable.

### Predict the next question
After the answer, briefly note the related thing they'll wonder about:
> "Worth knowing: this *also* explains why `for...of` over a Map gives oldest-first iteration — same insertion-order property. To get newest-first, you have to reverse explicitly."

### Use precise vocabulary
Senior devs benefit from terms they can search:
- "synchronous reconciliation" not "the rendering"
- "structural sharing" not "immutable updates"
- "discriminated union" not "kinds of types"
- "monomorphic call site" not "fast function call"

If a term is jargon-heavy, define it inline once: "the reconciler (the algorithm React uses to compare new and old element trees)".

## Things to Avoid

- ❌ **Reciting docs.** They've read the docs. Add insight or skip.
- ❌ **Long preambles.** "Great question! Let's dive in…" — get to the model.
- ❌ **Toy examples that obscure the point.** If you're explaining `useDeferredValue`, don't use a `useState<number>` counter — use a slow-list scenario.
- ❌ **Pretending things are simple when they aren't.** If something is genuinely subtle, name the subtlety. Senior devs respect "this is one of the edges of the model" more than false simplification.
- ❌ **Avoiding "I'm not sure" when relevant.** If a behavior is implementation-specific or undocumented, say so. Don't fabricate certainty.

## When the Concept Has a "Trap"

Many React/TS concepts have a subtle trap that experienced devs hit. Always surface these:

- `useEffect` cleanup runs *before* the next effect, not just on unmount
- `useState` setter doesn't merge — it replaces (unlike `setState` in classes)
- `useMemo` is a hint, not a guarantee — React can drop the cache
- TypeScript `as` doesn't validate at runtime
- `Promise.all` rejects on first failure, drops other resolutions
- Map iteration order is insertion order (not key order)
- `Object.keys()` returns strings, even for numeric keys

Naming the trap is often the most valuable part of the answer.
