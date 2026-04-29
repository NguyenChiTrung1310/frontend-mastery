---
name: challenge-author
description: |
  Use when the user wants to add a new challenge to the catalog. Triggers on requests like
  "add a challenge for X", "scaffold a new challenge", "create a closures challenge", or
  any request to extend the learning content. Covers folder creation, the four required files,
  registry registration, and the conventions each file must follow.
---

# Challenge Author

A challenge is **four files in a folder, plus one registry entry**. Miss any piece and the route won't resolve.

## Required Inputs

Before scaffolding, confirm with the user:

1. **Category** — one of `javascript`, `typescript`, `react`, `nextjs`, `dsa`
2. **Difficulty** — one of `basic`, `intermediate`, `advanced`
3. **Slug** — kebab-case, unique, descriptive (e.g. `closures-and-iife`, not `challenge-7`)
4. **Title** — human-readable, shown in sidebar and header
5. **Description** — one-liner, ~10-15 words, shown in sidebar
6. **Estimated time** — optional, in minutes

Do not invent values. Ask if any are missing.

## File Structure

```
src/challenges/<category>/<difficulty>/<slug>/
├── README.md          # Instructions — must explain WHY, not just WHAT
├── boilerplate.tsx    # User edits this — stub with TODOs
├── solution.tsx       # Reference implementation — fully working
└── mock-api.ts        # MSW handlers, fixtures, or `export {}` if not needed
```

## File Templates

### `README.md`

The README is the most important file. It teaches.

Structure:
```md
# <Title>

## 🎯 Scenario
[1-3 sentences setting up the problem in concrete terms]

## ❓ Why This Matters
[The conceptual depth — the WHY behind the WHAT]

## ✅ Tasks
[Numbered list of things to do, in difficulty order]

## 💡 Gotchas
[Common mistakes, edge cases, pitfalls]

## 🔍 Reference
[Links to docs that go deeper]
```

For **advanced** challenges, add a section explaining the underlying mental model (Fiber architecture, V8 internals, type theory, whatever applies). Look at `src/challenges/react/advanced/render-optimization/README.md` as the gold standard.

### `boilerplate.tsx`

Requirements:
- **Must** start with `'use client'` directive
- **Must** have a `default` export (loaded via `next/dynamic`)
- Default export name: `<PascalCaseSlug>Boilerplate`
- Top-of-file comment block explaining what the user is meant to build, with hints
- Stub implementations marked clearly with `// ❌ TODO:` comments
- The UI portion should be **functional** — they can interact with the broken implementation and see it fail

```tsx
'use client';

/**
 * 🚧 BOILERPLATE
 *
 * [What the user is meant to build]
 *
 * Hints:
 *  - [hint 1]
 *  - [hint 2]
 */

import { useState } from 'react';

// ❌ TODO: implement
function thingToImplement(): unknown {
  return null;
}

export default function MyChallengeBoilerplate(): React.JSX.Element {
  // [interactive UI that exercises the stub]
  return <div>...</div>;
}
```

### `solution.tsx`

Requirements:
- **Must** start with `'use client'`
- **Must** have a `default` export named `<PascalCaseSlug>Solution`
- Top-of-file comment block explaining the **why** of the chosen approach — not just the what
- Comments calling out tradeoffs explicitly ("Note: not virtualized because…")
- Same UI shape as the boilerplate so split-view comparison is direct

The solution's job is **teaching by example**. Comment density should be higher than typical production code.

### `mock-api.ts`

If the challenge needs mocked data or API responses, export them here. If not, just:

```ts
// Pure <category> challenge — no mock API needed.
export {};
```

For challenges needing fake delays:
```ts
function delay<T>(value: T, ms: number): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
```

For deterministic test data, use a seeded PRNG (see `react/advanced/render-optimization/mock-api.ts`).

## Registry Entry — Required

After creating the four files, add to `src/registry/challenges.ts`:

```ts
import myChallengeReadme from '@/challenges/<category>/<difficulty>/<slug>/README.md';

// ...inside CHALLENGES:
{
  slug: '<slug>',
  title: '<Title>',
  category: '<category>',
  difficulty: '<difficulty>',
  description: '<one-liner>',
  tags: ['<tag>'],
  estimatedMinutes: <number>,
  readme: myChallengeReadme as unknown as string,
  loaders: {
    boilerplate: () => import('@/challenges/<category>/<difficulty>/<slug>/boilerplate'),
    solution: () => import('@/challenges/<category>/<difficulty>/<slug>/solution'),
  },
},
```

The dynamic import paths **must be string literals that match the folder structure exactly** — Next.js's bundler analyzes them statically. Computed paths break code-splitting.

## Verification Checklist

After scaffolding, confirm:

- [ ] All four files exist in the right folder
- [ ] `boilerplate.tsx` and `solution.tsx` both start with `'use client'`
- [ ] Both have `export default` (not named export)
- [ ] Registry entry added to `src/registry/challenges.ts`
- [ ] `pnpm type-check` passes
- [ ] `pnpm build` passes (this validates the dynamic imports)
- [ ] Visiting `/challenges/<category>/<difficulty>/<slug>` renders without error

If `pnpm build` fails with "Cannot find module" — the most common cause is a path mismatch between the registry's import string and the actual folder name. Check casing and pluralization.

## What NOT to Do

- ❌ Skip the README — it's the highest-value file for the learner
- ❌ Skip the registry entry "to add later" — the route literally won't work
- ❌ Make the boilerplate non-functional in the UI — they need feedback that something is broken
- ❌ Give the boilerplate the working answer with `// uncomment to solve` — defeats the purpose
- ❌ Make the solution unreadable production code — comment density should be high

## Reference Examples by Category

When stuck, look at these for shape:

| Category | Reference |
|---|---|
| React | `src/challenges/react/advanced/render-optimization/` (the flagship) |
| TypeScript | `src/challenges/typescript/intermediate/generic-utility-types/` (type-only challenge pattern) |
| JavaScript | `src/challenges/javascript/basic/debounce-throttle/` (utility function pattern) |
| Next.js | `src/challenges/nextjs/advanced/streaming-suspense/` (Suspense + `use()` pattern) |
| DSA | `src/challenges/dsa/intermediate/lru-cache/` (test-runner pattern) |
