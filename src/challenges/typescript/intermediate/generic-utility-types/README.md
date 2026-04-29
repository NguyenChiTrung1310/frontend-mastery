# Build Your Own Utility Types

## 🎯 Scenario

`Pick`, `Omit`, `Partial`, `ReturnType` — you use them daily. But could you re-implement them?

This challenge tests your fluency with **mapped types**, **conditional types**, and **type inference** — the bedrock of advanced TypeScript.

## ✅ Tasks

Implement, from scratch:

1. `MyPick<T, K extends keyof T>` — equivalent to `Pick`.
2. `MyOmit<T, K extends keyof T>` — equivalent to `Omit`.
3. `DeepPartial<T>` — recursively makes every property optional.
4. `PromiseValue<T>` — extracts the resolved type from a Promise (handles nesting).

The boilerplate has type-level test cases. They'll show up in your TS server (and as TS errors in the IDE) when wrong.

## 💡 Key Concepts

- **Mapped types**: `{ [K in keyof T]: ... }`
- **Conditional types**: `T extends U ? X : Y`
- **`infer`**: extracts a type within a conditional type's `extends` clause
- **Distributive conditional types**: `T extends U` distributes over unions when `T` is naked

## 🔍 Reference

- [TS Handbook — Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- [TS Handbook — Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
