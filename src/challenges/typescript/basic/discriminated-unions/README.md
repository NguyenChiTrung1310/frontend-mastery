# Model State with Discriminated Unions

## 🎯 Scenario

Your team's API response type looks like this:

```ts
interface ApiState {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  data?: UserProfile;
  error?: string;
}
```

A component receives this and accesses `data.name` — only to crash because `isSuccess` is `true` but `data` is still `undefined`. TypeScript didn't catch it. Why? Because the flags are independent booleans: nothing prevents the object from having `isLoading: true` and `isSuccess: true` simultaneously.

Your job: refactor this into a **discriminated union** where impossible states are literally unrepresentable.

---

## 📂 Files

- `boilerplate.tsx` — The flawed boolean-flag type with `@ts-expect-error` markers. Edit this.
- `solution.tsx` — The tagged-union approach with exhaustive narrowing.
- `mock-api.ts` — No mock needed; this is a type-level challenge.

---

## ❓ Why This Matters

The goal is to make **invalid states unrepresentable at the type level**. With booleans:

```ts
// All of these are valid types — none of them should exist:
{ isLoading: true,  isSuccess: true,  isError: false } // impossible
{ isLoading: false, isSuccess: false, isError: false } // what state is this?
{ isLoading: false, isSuccess: true,  data: undefined } // success with no data?
```

With a discriminated union, you can't construct those:

```ts
type ApiState =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'success'; data: UserProfile };
```

Now TypeScript *knows* that `data` only exists when `status === 'success'`. The code becomes self-documenting and the type checker becomes your safety net.

---

## 🧠 How Narrowing Works

A **discriminant** is a literal-typed field that TypeScript uses to narrow the union branch:

```ts
if (state.status === 'success') {
  state.data; // ✓ TypeScript knows data exists here
}
```

The narrowing is structural — TypeScript checks that:
1. All branches have the same discriminant key (`status`).
2. The discriminant values are unique literals (not `boolean` or `string`).

**Exhaustiveness checking** with `never`:

```ts
function assertNever(x: never): never {
  throw new Error(`Unhandled case: ${String(x)}`);
}

switch (state.status) {
  case 'loading': ...
  case 'error': ...
  case 'success': ...
  default: assertNever(state); // TypeScript errors if you miss a branch
}
```

---

## ✅ Tasks

### Task 1 — Fix the base type

Replace the boolean-flag `ApiState` with a three-branch tagged union. The `@ts-expect-error` lines should still compile (they test the exhaustiveness).

### Task 2 — `renderApiState`

Write a function that takes `ApiState` and returns a string description. Use a `switch` + exhaustive `default: assertNever(...)`. TypeScript should error if you add a fourth branch and forget to handle it.

### Task 3 — `FormState` union

Model a multi-step form:
- `idle` — not yet submitted
- `submitting` — in flight (no extra fields)
- `success` — with `redirectUrl: string`
- `error` — with `fieldErrors: Record<string, string>`

### Task 4 — Bonus: narrow without `switch`

Use a type predicate to narrow without a switch statement:

```ts
function isSuccess<T>(state: ApiState): state is Extract<ApiState, { status: 'success' }> {
  return state.status === 'success';
}
```

---

## 💡 Gotchas

- **Boolean discriminants don't narrow** — `{ ok: true }` vs `{ ok: false }` works, but two booleans in combination don't. Always use string literals.
- **Optional fields break narrowing** — `data?: UserProfile` means data *might* exist even on the `success` branch. Move optional fields inside their branch.
- **`never` is the bottom type** — a function typed to return `never` must throw or loop infinitely. It's the type-safe way to assert "this code is unreachable".
- **Union vs intersection** — `A | B` means "either A or B". `A & B` means "both A and B". Don't mix them up when modelling state.

---

## 🔍 Reference

- [TypeScript Handbook: Discriminated Unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)
- [TypeScript Handbook: Exhaustiveness Checking](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking)
- [Making Impossible States Impossible — Richard Feldman (Elm talk, applies directly to TS)](https://www.youtube.com/watch?v=IcgmSRJHu_8)
