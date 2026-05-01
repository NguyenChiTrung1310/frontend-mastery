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

## Interactive Demo Style Guide

When scaffolding from a `SCAFFOLD THIS CHALLENGE:` prompt, apply this style
to `boilerplate.tsx` and `solution.tsx`. This is inspired by the web-playground
project's approach to making bugs tangible and fixes demonstrable.

### `boilerplate.tsx` — make the bug visually observable

The user must be able to **interact** with the broken state and immediately see
something go wrong. A boilerplate that just returns wrong data silently is not
enough. Follow these patterns:

- **Timestamped event log panel**: a scrollable `<ul>` or `<div>` that records
  what happened and when, with emoji prefixes (⏳ waiting, ⚠️ wrong, 🚨 error,
  ✅ success). Append entries as the user interacts. Style with
  `font-mono text-sm` and a `max-h-48 overflow-y-auto` container.
- **Status badge strip**: at the bottom of the component, a row of small badges
  showing current state — render count, error count, whether a leak is active, etc.
- **The bug must be jarring**: the user should feel "that's clearly wrong", not
  "hm, I wonder if something is off". Make the failure mode obvious and immediate.
- **UI primitives inline**: define any needed `Card`, `Badge`, `Alert`, `Button`
  as small `const` components at the top of the file using Tailwind CSS only.
  Do NOT import from `@/components/ui` — these files are self-contained.
- **Tailwind CSS only**: use Shadcn theme tokens (`bg-card`, `text-foreground`,
  `border-border`, etc.) so the component respects dark/light mode automatically.

### `solution.tsx` — same UI, fixed behavior, explanation included

- **Same UI shape** as `boilerplate.tsx` — the split-view comparison must be
  meaningful. Don't redesign the layout.
- **Explanation card**: a styled `<div>` below the interactive area with:
  - A title: `✅ Why This Works` or `🛡️ Solution Details`
  - 3 short bullet points explaining the mechanism in plain language
  - A **before/after code panel**: two small `<pre>` blocks side by side —
    left red-tinted (`bg-red-950/40 border-red-800`), right green-tinted
    (`bg-green-950/40 border-green-800`) — showing the critical diff
- **Dense comments**: higher comment density than typical production code.
  Each non-obvious line should explain WHY, not just WHAT.

### Log panel reference implementation

Both files can use this pattern for the event log:

```tsx
const [logs, setLogs] = useState<string[]>([]);
const addLog = (msg: string) =>
  setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));

// In JSX:
<div className="rounded-md border bg-muted/30 p-3 font-mono text-xs max-h-48 overflow-y-auto space-y-1">
  {logs.length === 0
    ? <p className="text-muted-foreground">No events yet…</p>
    : logs.map((log, i) => <p key={i}>{log}</p>)
  }
</div>
```

### Before/after code panel reference implementation

```tsx
<div className="grid grid-cols-2 gap-3 mt-4">
  <div className="rounded-md border border-red-800 bg-red-950/40 p-3">
    <p className="text-xs font-semibold text-red-400 mb-2">❌ Before</p>
    <pre className="text-xs text-red-200 whitespace-pre-wrap">{`// broken code here`}</pre>
  </div>
  <div className="rounded-md border border-green-800 bg-green-950/40 p-3">
    <p className="text-xs font-semibold text-green-400 mb-2">✅ After</p>
    <pre className="text-xs text-green-200 whitespace-pre-wrap">{`// fixed code here`}</pre>
  </div>
</div>
```
