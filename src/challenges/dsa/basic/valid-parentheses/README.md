# Valid Parentheses

## 🎯 Scenario

Given a string containing only `(`, `)`, `{`, `}`, `[`, and `]`, determine if the input is valid. A string is valid if every opening bracket has a corresponding closing bracket in the correct order and nesting. This is [LeetCode 20](https://leetcode.com/problems/valid-parentheses/) — the canonical gateway to stack problems.

## ❓ Why This Matters

The key insight is **LIFO** (Last In, First Out): the most recently opened bracket must be the next one closed. That property maps perfectly to a stack. If you understand why a stack solves this, you understand the mental model behind expression parsers, undo/redo systems, and recursive call frames.

The **MATCHING map pattern** is the idiomatic solution:

```ts
const MATCHING: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
```

Closing brackets map to their expected opening bracket. On every closing bracket, pop the stack and compare with `MATCHING[char]`. If they differ — or if the stack is empty when you try to pop — the string is invalid. After iterating all characters, the stack must be empty (no unclosed opens).

## ✅ Tasks

1. Implement `isValid(s: string): boolean` using a stack.
2. Pass all 6 test cases in the console panel (including the always-returning-`true` failures).
3. Aim for **O(n) time, O(n) space** — each character is visited at most once.

## 💡 Gotchas

- **Empty string is valid** — the loop does nothing, the stack stays empty, return `true`.
- **Single bracket is invalid** — e.g. `"("` — loop pushes it, stack is non-empty at end, return `false`.
- **Only opens, no closes** — e.g. `"((("` — all pushed, stack non-empty at end, `false`.
- **Interleaved, not just nested** — `"([)]"` is invalid even though each bracket type is balanced in count. The stack catches this because the top is `[` when you encounter `)`, which doesn't match `MATCHING[')'] === '('`.
- **Pop on empty stack** — check `stack.length > 0` before popping, or `stack.pop()` returns `undefined` which won't equal any opening bracket (safe but worth being explicit about).

## 🔍 Reference

- [LeetCode 20 — Valid Parentheses](https://leetcode.com/problems/valid-parentheses/)
- [Stack data structure — MDN Array docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)

### Real-world uses

| Use case | Why stacks |
|---|---|
| JSX / HTML parser | Track open tags, verify close tags match in order |
| JSON parsing | Validate nested `{` / `[` pairing |
| Compiler lexer | Expression balancing, `BEGIN`/`END` blocks |
| Undo/redo | Each action pushed; undo pops |
