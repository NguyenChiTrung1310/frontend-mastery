---
name: typescript-best-practices
description: |
  Reference rules for writing TypeScript in this repository. Auto-load before writing
  any new .ts or .tsx file, or when fixing type / lint errors. Covers the project's
  strict tsconfig, ESLint rules, React/Next.js patterns, and the specific failure
  modes that have caused build breakage in this codebase.
---

# TypeScript Best Practices — frontend-mastery

This file is the authoritative style guide for TypeScript in this repo.
Read it **before** writing any new `.ts` / `.tsx` file.

---

## 1. Project Config — Know Your Constraints

```jsonc
// tsconfig.json (abridged)
{
  "strict": true,               // all strict flags ON
  "noUncheckedIndexedAccess": true,   // array[i] → T | undefined
  "noImplicitOverride": true    // `override` keyword required on subclass methods
}
```

These are stricter than Next.js defaults. Every rule below derives from them.

---

## 2. Array & Map Access — Always Guard

`noUncheckedIndexedAccess: true` means every indexed read returns `T | undefined`.

### Arrays
```ts
// ❌ Will fail type-check
const first = arr[0].name;

// ✅ Non-null assertion (only when you KNOW it exists)
const first = arr[0]!.name;

// ✅ Explicit guard (prefer for logic that could genuinely be empty)
const first = arr[0];
if (first !== undefined) { first.name; }

// ✅ When using an array value as a secondary index
const idx = indices[i];
const node = idx !== undefined ? children[idx] : undefined;
```

### Map.get()
```ts
// ❌ Map.get() also returns T | undefined
const value = map.get(key).name;

// ✅
const value = map.get(key);
if (value !== undefined) { value.name; }
// or:
const value = map.get(key)!; // only if you just set the key
```

### for-of over arrays — safe, no guard needed
```ts
for (const item of arr) { item.name; } // item is T, not T | undefined
```

---

## 3. Generic Constraints — Prefer `keyof T` Over `string`

`Record<string, unknown>` requires an explicit index signature on the type argument.
Concrete interfaces (e.g. `{ foo: string; bar: number }`) don't have one, so they
fail the constraint.

```ts
// ❌ Breaks for concrete interfaces without [key: string]: unknown
class Emitter<T extends Record<string, unknown>> { ... }

// ✅ Accepts concrete interfaces — says "all values extend unknown"
class Emitter<T extends Record<keyof T, unknown>> { ... }
```

Use `Record<keyof T, unknown>` for event maps, generic stores, and similar patterns.

---

## 4. `@ts-expect-error` vs `@ts-ignore`

- **Always prefer `@ts-expect-error`** — it errors if the suppressed line has no error (TS2578), which catches stale suppressions.
- **`@ts-ignore`** only when `@ts-expect-error` would itself produce TS2578 (e.g. conditional types that evaluate to `true` with `unknown` in TS 5.x).
  In that case, add an `eslint-disable-next-line @typescript-eslint/ban-ts-comment` comment above it.

```ts
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- Equal<unknown, X> doesn't error with TS5 conditional type handling
type _t = Expect<Equal<MyOmit<User, 'address'>, { id: number; name: string }>>;
```

Multi-line type expressions: the `@ts-expect-error` covers only the **next line**.
If the type error is reported on an inner line (e.g. a generic argument on line 3 of a
4-line expression), put the whole expression on **one line**:

```ts
// ❌ Error at line 3, not covered by directive on line 1
// @ts-expect-error
type _t = Expect<
  Equal<DeepPartial<User>, { ... }>  // error here — not covered
>;

// ✅
// @ts-expect-error
type _t = Expect<Equal<DeepPartial<User>, { id?: number; name?: string }>>;
```

---

## 5. ESLint Rules That Fail the Build

The following rules are treated as **Errors** (not warnings) and will break `pnpm build`:

| Rule | Common mistake | Fix |
|------|---------------|-----|
| `react/no-unescaped-entities` | `"text"` or `'text'` literals inside JSX | Use `&quot;` / `&apos;` / `{'"'}` |
| `@typescript-eslint/ban-ts-comment` | `// @ts-ignore` without a disable comment | Use `@ts-expect-error` instead |
| `@typescript-eslint/no-unused-expressions` | `a ?? b.set(...)` as a statement | Rewrite as `if (!a) b.set(...)` |
| `@typescript-eslint/no-explicit-any` | `any` in type position | Use `unknown` + narrowing |

The following are **Warnings** (don't block build but indicate problems):

| Rule | Common cause |
|------|-------------|
| `@typescript-eslint/no-unused-vars` | Unused type params (`K`, `T`), test vars (`_t1`) |

### JSX string literals — quick reference
```tsx
// ❌ Breaks build
<p>Click "Submit" to continue.</p>
<p>Don't stop.</p>

// ✅
<p>Click &quot;Submit&quot; to continue.</p>
<p>Don&apos;t stop.</p>
// or: use curly-brace expression
<p>Click {'"'}Submit{'"'} to continue.</p>
```

---

## 6. Type Annotations on Exported Functions

Always annotate return types on exported functions and React components:

```ts
// ❌ Implicit return type
export function findChallenge(path: ChallengePath) { ... }

// ✅
export function findChallenge(path: ChallengePath): ChallengeEntry | undefined { ... }
```

React components must return `React.JSX.Element` (not `JSX.Element` — the `React.` prefix
is required because this project doesn't set `jsxImportSource`):

```tsx
export function MyComponent(): React.JSX.Element { ... }
// or when null is possible:
export function MyComponent(): React.JSX.Element | null { ... }
```

---

## 7. `unknown` Over `any`

Any `as any` that crosses a module boundary is a type-hole. Use `unknown` + narrowing instead.

```ts
// ❌
function parse(raw: any) { return raw.data; }

// ✅
function parse(raw: unknown) {
  if (typeof raw !== 'object' || raw === null || !('data' in raw)) {
    throw new Error('Unexpected shape');
  }
  return raw.data;
}
```

Internal casts (`as T` inside a class where you control both sides) are acceptable —
but add a comment explaining the invariant the cast relies on.

---

## 8. Discriminated Unions — Prefer Over Boolean Flags

```ts
// ❌ Boolean flags allow impossible combinations
interface State { isLoading: boolean; isError: boolean; data?: User; }

// ✅ Tagged union — impossible states are unrepresentable
type State =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'success'; data: User };
```

Use `assertNever` for exhaustive switches:
```ts
function assertNever(x: never): never {
  throw new Error(`Unhandled case: ${String(x)}`);
}
switch (state.status) {
  case 'loading': ...
  case 'error': ...
  case 'success': ...
  default: assertNever(state); // TS errors here if you add a 4th branch and forget it
}
```

---

## 9. React Component Patterns

### `'use client'` directive
- Required on **every** challenge boilerplate and solution file (they load via `next/dynamic` with `ssr: false`).
- Not needed for pure utility files (`mock-api.ts`, type files).

### Default exports for challenge files
All `boilerplate.tsx` and `solution.tsx` files must use `export default` — they're
loaded by `next/dynamic` which expects a default export.

### Controlled form inputs — prefer `name` attribute for Server Actions
```tsx
// For useFormState forms — use uncontrolled inputs read by FormData
<input name="email" type="text" />
// NOT:
<input value={email} onChange={e => setEmail(e.target.value)} name="email" />
```

### Cleanup in `useEffect`
Every `useEffect` that starts async work or sets up a subscription must return a cleanup:
```ts
useEffect(() => {
  const controller = new AbortController();
  // ... use controller.signal
  return () => controller.abort(); // ← required
}, [query]);
```

---

## 10. Checklist Before Committing New Challenge Files

Run these in order:

```bash
pnpm type-check   # must exit 0
pnpm build        # must exit 0 — validates registry dynamic imports
```

Common failure modes:

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Type 'undefined' cannot be used as index` | `arr[i]` used as index without guard | `const v = arr[i]; if (v !== undefined) arr2[v]` |
| `Unused '@ts-expect-error' directive` | The suppressed line has no error | Remove directive, or switch to `@ts-ignore` + eslint-disable |
| `react/no-unescaped-entities` | `"` or `'` in JSX text | Replace with `&quot;` / `&apos;` |
| `no-unused-expressions` | `a ?? b()` as statement | `if (!a) b()` |
| `Cannot find module '@/challenges/...'` | Registry path typo | Match path exactly to folder name (case-sensitive) |
| `Functions cannot be passed to Client Components` | Passing component functions or Map as props across Server→Client boundary | Pass `ReactNode` slots, strip `loaders`, convert Map to plain Record |
| `Type X does not satisfy constraint Record<string, unknown>` | Concrete interface lacks string index signature | Change constraint to `Record<keyof T, unknown>` |
