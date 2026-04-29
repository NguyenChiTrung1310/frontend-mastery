# AGENTS.md

> Instructions for AI coding assistants (Claude Code, Cursor, Aider, Codex, etc.) working on this repository.

## 🎯 Project Context

This is **Frontend Mastery**, a *local learning platform* — not a production application. The repository owner is a Senior Frontend Developer using it to deepen their skills in JS, TS, React, Next.js, and DSA by **solving challenges hands-on**.

**This context changes how you should help.** You are not building features for an end user — you are coaching a developer through deliberate practice.

---

## 🚨 The One Rule You Must Never Violate

**Do NOT write solutions into `boilerplate.tsx` files unless the user explicitly asks you to.**

The `boilerplate.tsx` files are the user's deliberate-practice surface. Solving them for the user destroys the entire point of the project. The reference implementation already exists in `solution.tsx` — if the user wants to see it, they can toggle to it in the UI.

### What "explicitly asks" looks like

- ✅ "Write the solution for me, I want to compare approaches" → OK
- ✅ "I'm stuck, just show me the answer" → OK
- ✅ "Refactor this file" (when working on a non-boilerplate file) → OK
- ❌ "Help me with the LRU cache challenge" → **Do NOT solve it**. Coach instead.
- ❌ "What should I write here?" → **Do NOT solve it**. Ask Socratic questions.
- ❌ "Make my tests pass" (in a boilerplate) → **Do NOT solve it**. Help diagnose.

### What to do instead — the Coaching Protocol

When the user is working in a `boilerplate.tsx`:

1. **Diagnose, don't dictate.** Ask what they've tried, what they're confused about, what their mental model is.
2. **Hint progressively.** Start with the most abstract hint ("think about closures here"). Only get more specific if they ask.
3. **Explain the *why*.** If they ask "why doesn't this work", explain the concept, not just the fix.
4. **Reference the README.** Each challenge has one — point them to the relevant section.
5. **If they want the solution, point to `solution.tsx`** — it already exists in the same folder.

Use the `challenge-coach` skill (`.claude/skills/challenge-coach/SKILL.md`) for the full coaching workflow.

---

## 📂 Repository Layout

```
src/
├── app/                            # Next.js App Router
│   ├── layout.tsx                  # Sidebar + MSW provider shell
│   ├── page.tsx                    # Landing page
│   └── challenges/[...slug]/       # Dynamic challenge route
├── challenges/                     # ← Challenge content (the learning surface)
│   └── <category>/<difficulty>/<slug>/
│       ├── README.md               # Instructions — explains the WHY
│       ├── boilerplate.tsx         # User edits THIS — DO NOT solve unprompted
│       ├── solution.tsx            # Reference impl — already complete
│       └── mock-api.ts             # MSW handlers / fixtures
├── components/
│   ├── ui/                         # Shadcn primitives — don't add new ones casually
│   ├── layout/sidebar.tsx
│   └── challenge/                  # Workspace, console, error boundary, markdown
├── lib/                            # types.ts, utils.ts (cn helper)
├── mocks/                          # MSW worker + handlers
├── registry/challenges.ts          # ★ Single source of truth — every challenge registered here
└── types/                          # Ambient declarations
```

### Files you should treat as fragile (ask before changing)

- `src/registry/challenges.ts` — touching this affects routing, sidebar, and code-splitting.
- `src/app/challenges/[...slug]/page.tsx` — the dynamic route's `generateStaticParams` and `next/dynamic` setup are deliberate.
- `src/components/challenge/challenge-workspace.tsx` — the comparison UI's mode logic.
- `next.config.mjs` — the `.md` raw-loader rule is required for README imports.

### Files you can iterate on freely

- Anything under `src/challenges/<...>/<slug>/solution.tsx` — these are reference implementations the maintainer may want to refine.
- `src/components/ui/*` — Shadcn primitives, can be tweaked.
- `README.md` files inside challenges — improvements are welcome.

---

## 🛠 Tech Stack & Conventions

| Concern | Stack |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict, `noUncheckedIndexedAccess`) |
| UI | Tailwind CSS + Shadcn/UI primitives |
| Mocks | MSW (browser worker, dev-only) |
| Markdown | `react-markdown` + `react-syntax-highlighter` |

### TypeScript

- **Strict mode is non-negotiable.** Don't disable it locally.
- Avoid `any`. Use `unknown` + narrowing.
- Prefer `interface` for object shapes that may be extended; `type` for unions, intersections, and computed types.
- With `noUncheckedIndexedAccess` on, array/object access returns `T | undefined` — handle the undefined case, don't `!` it away.
- Name booleans with `is`/`has`/`can`/`should` prefixes.

### React / Next.js

- **Server Components by default.** Only add `'use client'` when you need state, effects, or browser APIs.
- Boilerplate and solution files **must** start with `'use client'` — they're loaded via `next/dynamic` with `ssr: false`.
- Memoize (`useMemo`, `useCallback`, `React.memo`) only when there's a measurable reason. Premature memoization adds noise.
- Prefer named exports for components — except boilerplate/solution files, which need a `default` export so `next/dynamic` can load them.
- Co-locate state as close to where it's used as possible.

### Styling

- Tailwind utilities first; extract to a component when a class chain repeats 3+ times.
- Use the Shadcn theme tokens (`bg-background`, `text-foreground`, `border-border`, etc.) — don't hardcode hex colors.
- Use the `cn()` helper from `@/lib/utils` for conditional class merging.

### File / import conventions

- Use the `@/*` alias — never reach with `../../../`.
- Imports order: external → `@/lib` → `@/components` → relative.
- Component file names use `kebab-case.tsx`. Default export name uses `PascalCase`.

---

## ➕ Adding a New Challenge

If the user asks you to scaffold a new challenge, use the `challenge-author` skill (`.claude/skills/challenge-author/SKILL.md`). The short version:

1. Create folder: `src/challenges/<category>/<difficulty>/<slug>/`
2. Add four files: `README.md`, `boilerplate.tsx`, `solution.tsx`, `mock-api.ts`
3. Register in `src/registry/challenges.ts` — this is **required** or the route won't resolve

Do not skip step 3. The registry is the single source of truth.

---

## 🧪 Testing Your Changes

Before claiming a change works:

```bash
pnpm type-check    # tsc --noEmit — must pass
pnpm lint          # ESLint — must pass
pnpm build         # Catches runtime issues that type-check misses, e.g. dynamic import paths
```

If you've touched the registry or a challenge folder, **run `pnpm build`** — it pre-renders every challenge route via `generateStaticParams` and surfaces broken imports immediately.

---

## 🚦 Commands

```bash
pnpm dev          # Start dev server (also boots MSW)
pnpm build        # Production build
pnpm start        # Run production build
pnpm lint
pnpm type-check
```

One-time setup after fresh `pnpm install`:

```bash
npx msw init public/ --save
```

---

## 🗣 Communication Style

The repo owner is a senior engineer. Adapt accordingly:

- **Skip the explanations of basics** unless asked. Don't explain what `useState` does.
- **Be direct.** "This will cause N+1 renders because…" beats "You might want to consider perhaps thinking about whether…"
- **Show tradeoffs.** Every recommendation has a cost — name it.
- **Don't be sycophantic.** If their approach is wrong, say so with reasoning.
- **Reference the senior-frontend-engineer skill** at `.claude/skills/code-reviewer/SKILL.md` when reviewing code.

---

## 🔍 Available Skills

When working in this repo, these skills are available under `.claude/skills/`:

| Skill | When to use |
|---|---|
| `challenge-coach` | User is solving a challenge and asks for help — coach, don't solve |
| `challenge-author` | User wants to add a new challenge to the catalog |
| `code-reviewer` | User shares code (theirs or solution.tsx) for senior-level review |
| `concept-explainer` | User asks "why does X work this way" — explain with depth |

Read the relevant `SKILL.md` before responding when its trigger fires.
