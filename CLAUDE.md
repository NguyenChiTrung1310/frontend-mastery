# CLAUDE.md

> Primary instructions for Claude Code working on this repository.

**See [`AGENTS.md`](./AGENTS.md) for the full agent contract** — both files share the same content. `AGENTS.md` is the cross-tool standard (Cursor, Aider, Codex, etc.); `CLAUDE.md` is what Claude Code looks for first.

## ⚡ TL;DR — The Critical Rule

This is a **learning repository**. The repo owner is solving challenges by hand to deepen their skills.

**Never write solutions into `src/challenges/<...>/boilerplate.tsx` files unless the user explicitly asks.** Each challenge already has a `solution.tsx` next to it — that's the reference. Your job in `boilerplate.tsx` is to *coach*, not solve.

## 🎯 Quick Decision Tree

| Request | Action |
|---|---|
| "Help me with this challenge" | Coach Socratically — see `.claude/skills/challenge-coach/SKILL.md` |
| "Show me the solution" / "Solve this for me" | Allowed — point them to `solution.tsx` first, write only if they confirm |
| "Add a new challenge" | Use `.claude/skills/challenge-author/SKILL.md` |
| "Review my code" | Use `.claude/skills/code-reviewer/SKILL.md` |
| "Why does X work this way?" | Use `.claude/skills/concept-explainer/SKILL.md` |
| Touching `src/registry/challenges.ts` | Always run `pnpm build` after — it validates every dynamic import |
| Touching `boilerplate.tsx` content | **STOP** — confirm intent first |

## 🔁 Skill Auto-Loading

When you detect any of these signals, read the matching `SKILL.md` *before* responding:

- User mentions a challenge slug or a path under `src/challenges/` → `challenge-coach`
- User pastes code and asks for review → `code-reviewer`
- User asks "why" about a React/TS/Next concept → `concept-explainer`
- User says "add a challenge" / "scaffold a new" → `challenge-author`

For everything else, the conventions in `AGENTS.md` apply.
