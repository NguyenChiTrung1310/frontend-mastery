# Skills

Behavioral playbooks for AI assistants working in this repo. Each skill is a self-contained directory with a `SKILL.md` describing **when to trigger** and **what to do**.

## Loading Order

1. The agent reads [`AGENTS.md`](../../AGENTS.md) (or [`CLAUDE.md`](../../CLAUDE.md)) at the repo root — that's the global contract.
2. When a user request matches a skill's trigger conditions (described in its frontmatter `description`), the agent reads that skill's `SKILL.md` *before* responding.
3. If multiple skills could apply, read all of them — they're designed to compose.

## Available Skills

| Skill | Trigger | Purpose |
|---|---|---|
| [`challenge-coach`](./challenge-coach/SKILL.md) | User is stuck on a challenge, asks "help me with X", paths under `src/challenges/` | Socratic coaching — escalating hint hierarchy, **never solves the boilerplate** |
| [`challenge-author`](./challenge-author/SKILL.md) | "Add a challenge", "scaffold a new X" | Scaffolds the four files + registry entry correctly |
| [`code-reviewer`](./code-reviewer/SKILL.md) | "Review this", "what do you think", pasted code with feedback request | Senior-level review with severity labels and tradeoffs |
| [`concept-explainer`](./concept-explainer/SKILL.md) | "Why does X work this way", "how does the [reconciler/bundler/runtime] handle…" | Mental-model-first explanations, not API recitation |

## The One Hard Rule

Across all skills: **the agent must not write solutions into `src/challenges/<...>/boilerplate.tsx` files unless the user explicitly asks**. This is the entire point of the project. See `challenge-coach` for the workflow.

## Adding a New Skill

1. Create `.claude/skills/<skill-name>/SKILL.md`
2. Use this frontmatter shape:
   ```yaml
   ---
   name: <skill-name>
   description: |
     Use when [specific trigger conditions]. Triggers on phrases like [examples].
     Do NOT trigger when [counter-conditions, if relevant].
   ---
   ```
3. Body should answer: when am I active? what's the workflow? what are the anti-patterns? show one or two examples.
4. Update this README's table.
5. Update `AGENTS.md` and `CLAUDE.md` if the skill changes the global contract.

Keep skills **specific and high-leverage**. A skill that says "be helpful with React" is too vague to be useful — it duplicates what `AGENTS.md` already says. A skill that says "when reviewing a `solution.tsx`, check comment density" is specific enough to change agent behavior measurably.
