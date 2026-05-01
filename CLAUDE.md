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
- Writing or editing any `.ts` / `.tsx` file in this repo → `typescript-best-practices`
- Fixing a type error, lint error, or build failure → `typescript-best-practices`

For everything else, the conventions in `AGENTS.md` apply.

## 📋 Scaffolding Challenges

When the user pastes a prompt that contains a `SCAFFOLD THIS CHALLENGE:` block,
treat it as a direct execution instruction — **no clarifying questions, no confirmation**.
Read `.claude/skills/challenge-author/SKILL.md` for the full workflow including:

- The four required files and their conventions
- The **interactive demo style guide** — how `boilerplate.tsx` must make the bug
  visually observable and how `solution.tsx` must include an explanation card
- The registry entry format
- The verification checklist (always run `pnpm type-check` + `pnpm build`)

The prompt will already contain everything needed: category, difficulty, slug,
title, description, tags, estimated time, concept, boilerplate scenario, solution
approach, and mock-api requirements. Extract those values and proceed.

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
|------|----------|
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.
