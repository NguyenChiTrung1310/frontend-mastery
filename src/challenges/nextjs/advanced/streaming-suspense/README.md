# Streaming SSR with Suspense

## 🎯 Scenario

You have a dashboard page with three sections:
- **User profile** — fast (<50ms)
- **Recent orders** — medium (~500ms)
- **Recommended products** — slow (~2000ms, calls a 3rd-party API)

In the boilerplate, the page **awaits all three** before responding. TTFB is 2+ seconds. Pure jQuery-era SSR.

Your job: refactor so the user sees the profile **immediately**, with the slower sections streaming in as their data resolves.

## ❓ Why Streaming Works

Next.js App Router's RSC streaming works like this:

1. The server starts rendering the page tree.
2. When it hits a `<Suspense fallback={...}>` boundary, it sends the fallback markup down and **doesn't block on the children**.
3. As each Suspense boundary's children resolve, the server pushes the rendered HTML + the placement instructions to the client over the same response.
4. The client swaps the fallback for the real content.

The user's TTFB now matches the *fastest* section, not the slowest.

## ✅ Tasks

1. Wrap each slow section in `<Suspense fallback={<Skeleton />}>`.
2. Move data fetching **inside** each section component (don't await everything in the parent).
3. Use the `loading.tsx` convention for the route shell.

## 💡 Gotchas

- A Suspense boundary in an RSC tree only suspends if a child **awaits** something. If you await in the parent, the whole subtree blocks.
- `<Suspense>` does not work for client components fetching with `useEffect` — you need a Suspense-compatible data layer (RSC `await`, `use()` hook with a thrown promise, etc.).
- `loading.tsx` provides the **route-level** Suspense boundary; nested `<Suspense>` provides **section-level** ones.

## 🔍 Reference

- [Next.js docs — Streaming](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [React docs — Suspense](https://react.dev/reference/react/Suspense)

> **Note**: This challenge demonstrates the *pattern* in a client-only sandbox using
> simulated promises. In a real Next.js page, these would be RSCs — same mental
> model, no `'use client'` directive.
