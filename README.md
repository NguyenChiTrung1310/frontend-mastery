# Frontend Mastery — Local Learning Platform

An interactive, **local-first** platform for deepening your skills in JavaScript, TypeScript, React, Next.js, and DSA. You solve challenges by editing real files in your IDE; this Next.js app renders both your work and the expert solution side-by-side, with instructions, a console panel, and a mock API server (MSW) ready out of the box.

## ✨ Core Idea

| | |
|---|---|
| **Where you write code** | Your IDE — `boilerplate.tsx` files under `src/challenges/...` |
| **Where you see results** | This Next.js app at `localhost:3000` |
| **Where you compare** | Side-by-side toggle: *Your work* ↔ *Expert solution* |

Every challenge ships as a folder of four files:

```
src/challenges/<category>/<difficulty>/<slug>/
├── README.md       # The "why" — instructions, hints, deeper concepts
├── boilerplate.tsx # The starting point — you edit this
├── solution.tsx    # The reference implementation — read after you try
└── mock-api.ts     # MSW handlers or fixture data (optional content)
```

## 🚀 Getting Started

```bash
# 1. Install
pnpm install

# 2. One-time MSW setup (writes the service worker shim to /public)
npx msw init public/ --save

# 3. Run
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

> Requires Node 18.18+ and pnpm 9+. `npm` and `yarn` work too — just swap the commands.

## 🧱 Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | RSCs, file-based routing, mature ecosystem |
| Language | TypeScript (strict, `noUncheckedIndexedAccess`) | Catch off-by-one and missing-key bugs at compile time |
| UI | Tailwind CSS + Shadcn/UI primitives | Token-driven theming, no external CSS bundle |
| Mock API | MSW (Mock Service Worker) | Real `fetch()` calls — no SDK swapping |
| Code-splitting | `next/dynamic` per challenge | Each challenge is its own JS chunk |
| Markdown | `react-markdown` + `react-syntax-highlighter` | GFM + Prism-themed code blocks |

## 🗂 Project Structure

```
frontend-mastery/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root shell (sidebar + MSW provider)
│   │   ├── page.tsx                # Landing page
│   │   ├── globals.css             # Shadcn theme tokens
│   │   └── challenges/[...slug]/
│   │       └── page.tsx            # Catch-all challenge route
│   ├── challenges/                 # ← Where the learning content lives
│   │   ├── javascript/basic/debounce-throttle/
│   │   ├── typescript/intermediate/generic-utility-types/
│   │   ├── react/advanced/render-optimization/
│   │   ├── nextjs/advanced/streaming-suspense/
│   │   └── dsa/intermediate/lru-cache/
│   ├── components/
│   │   ├── ui/                     # Shadcn primitives (Button, Card, Tabs, …)
│   │   ├── layout/sidebar.tsx
│   │   └── challenge/              # Workspace, console, error boundary, markdown
│   ├── lib/
│   │   ├── types.ts                # ChallengeEntry, ChallengeMeta, …
│   │   └── utils.ts                # `cn()` helper
│   ├── mocks/                      # MSW worker + handlers
│   ├── registry/challenges.ts      # ★ Single source of truth for all challenges
│   └── types/markdown.d.ts         # Raw `.md` import declaration
├── public/                         # Static assets (mockServiceWorker.js lives here)
├── components.json                 # Shadcn config
├── next.config.mjs                 # Includes the .md raw-loader rule
├── tailwind.config.ts              # Theme tokens + typography plugin
└── tsconfig.json                   # Strict + path aliases
```

## ➕ Adding a New Challenge

1. Create the folder: `src/challenges/<category>/<difficulty>/<slug>/`.
2. Add four files: `README.md`, `boilerplate.tsx`, `solution.tsx`, `mock-api.ts`.
3. Register it in `src/registry/challenges.ts`:

```ts
import myChallengeReadme from '@/challenges/react/intermediate/my-thing/README.md';

export const CHALLENGES = [
  // ... existing entries
  {
    slug: 'my-thing',
    title: 'My New Challenge',
    category: 'react',
    difficulty: 'intermediate',
    description: 'One-liner shown in sidebar.',
    tags: ['hooks'],
    estimatedMinutes: 30,
    readme: myChallengeReadme as unknown as string,
    loaders: {
      boilerplate: () => import('@/challenges/react/intermediate/my-thing/boilerplate'),
      solution: () => import('@/challenges/react/intermediate/my-thing/solution'),
    },
  },
];
```

That's it — sidebar, routing, and code-splitting are wired up automatically.

### Why a hardcoded registry instead of filesystem scanning?

1. **Type safety** — typos in slugs/categories surface at build time, not runtime.
2. **Bundling** — Next.js can only code-split via *statically analyzable* `import()` calls. Filesystem scans break per-route chunking and force every challenge into one bundle.
3. **Determinism** — adding a challenge is one explicit registry entry, not "drop a folder somewhere and pray". Scales as the catalogue grows.

The tradeoff is one extra registry edit per challenge. Worth it.

## 🧪 Mock API (MSW)

Two shared endpoints come pre-configured in `src/mocks/handlers.ts`:

- `GET /api/slow?ms=1500` — returns after a configurable delay (Suspense demos).
- `GET /api/flaky` — fails 50% of the time (retry / error-handling demos).

Add per-challenge handlers in the challenge's `mock-api.ts` and merge them into the worker if needed. MSW only boots in development — production bundles never include it.

## 🧠 The Comparison UI

The `ChallengeWorkspace` component supports three view modes:

- **Mine** — only your boilerplate renders
- **Split** — boilerplate and solution side-by-side
- **Solution** — only the reference implementation

For JS/DSA challenges, a console panel mirrors all `console.*` output — useful for "did my function actually run?" feedback.

The `PreviewErrorBoundary` keeps the rest of the app interactive even if your boilerplate throws on render — fix the file, save, hot reload.

## 🎯 Example Challenge: React Render Optimization

The flagship example at `src/challenges/react/advanced/render-optimization/` walks through:

1. **Diagnosing** why filtering a 10,000-item list lags the input.
2. **Why** React renders are synchronous and uninterruptible by default.
3. **The Fiber model** of urgent updates, transitions, and deferred values.
4. **Applying** `useDeferredValue` + `React.memo` for measurable wins.
5. **When NOT to** reach for concurrent features — they're not free.

Open `/challenges/react/advanced/render-optimization` and try typing fast in the boilerplate vs. the solution. The difference is dramatic.

## 🤖 For AI Assistants

This repo ships with full instructions for IDE-based AI assistants (Claude Code, Cursor, Aider, Codex, etc.):

- [`AGENTS.md`](./AGENTS.md) — primary instruction file (cross-tool standard)
- [`CLAUDE.md`](./CLAUDE.md) — Claude Code's preferred filename, mirrors `AGENTS.md`
- [`.cursorrules`](./.cursorrules) — Cursor-specific rules
- [`.claude/skills/`](./.claude/skills/) — modular skill files for specific tasks:
  - `challenge-coach` — Socratic guidance for solving challenges (never writes the answer)
  - `challenge-author` — scaffolding new challenges correctly
  - `code-reviewer` — senior-level code review with severity labels
  - `concept-explainer` — mental-model-first deep-dives

The most important rule encoded across these files: **AI assistants will not write solutions into `boilerplate.tsx` files unless explicitly asked**. The whole point of the project is hands-on practice — having an LLM solve it for you defeats the purpose.

## 📋 Scripts

```bash
pnpm dev          # Start dev server
pnpm build        # Production build (also pre-renders all challenge routes)
pnpm start        # Run the production build
pnpm lint         # ESLint
pnpm type-check   # tsc --noEmit
```

## 📝 License

MIT — built for learning, share freely.
