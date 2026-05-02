# useReducer for Complex State

## 🎯 Scenario

A contact form manages four pieces of state with separate `useState` calls: `isSubmitting`,
`isSuccess`, `errorMessage`, and `formData`. Every submit handler must update all of them in
sync — success clears the error and sets the flag, error resets the loading state and sets the
message, resubmit must clear the previous error first. Miss one call anywhere and the UI is
inconsistent. The "Bug Injector" panel lets you introduce each class of mistake deliberately
so you can see exactly what breaks.

---

## ❓ Why This Matters

### When useState is fine vs when useReducer pays off

`useState` is the right tool when pieces of state are **independent** — e.g. an input field's
value, a toggle's open/closed state, a counter. You don't need a reducer for that.

You need `useReducer` when state pieces must **always transition together**:

```tsx
// ❌ Three setState calls that must all stay in sync
setIsSubmitting(false);   // easy to forget on one code path
setErrorMessage(msg);
setIsSuccess(false);      // still true from a previous run?

// ✅ One dispatch — the reducer owns all transitions
dispatch({ type: 'SUBMIT_ERROR', payload: msg });
```

The signal is: "I keep writing if-chains to decide which setState calls to make."

### The discriminated union state shape

Model your state as a union of mutually exclusive phases, not a bag of booleans:

```tsx
type FormState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success' }
  | { status: 'error'; message: string }; // message only exists in error phase
```

This makes **impossible states unrepresentable**. With booleans, nothing stops
`{ isSuccess: true, isError: true }` from existing — TypeScript doesn't know it's illegal.
With a discriminated union, TypeScript enforces that a form is either successful OR errored,
never both. The compiler becomes your consistency checker.

### The "impossible states unrepresentable" principle

Coined in the functional programming world ("Making Impossible States Impossible" — Richard
Feldman's ElmConf talk). The goal: encode your business rules in the type system so that
invalid program states can't even be constructed.

```tsx
// With booleans — impossible state is representable (just wrong)
{ isSuccess: true, errorMessage: "oh no" } // TypeScript: fine

// With discriminated union — impossible state can't exist
{ status: 'success' }            // correct
{ status: 'error', message: '' } // message is always present when status === 'error'
// You literally cannot write { status: 'success', message: '...' } — the type won't allow it
```

---

## ✅ Tasks

1. **Trigger the bugs** — toggle each bug in the Bug Injector, submit the form, observe.
   - Bug 1: Submit with "Simulate failure" checked. Button stays stuck.
   - Bug 2: Submit successfully. Both success AND error appear simultaneously.
   - Bug 3: Submit and fail. Then submit again — old error persists during loading.
2. **Define `FormState`** — a discriminated union with `idle | submitting | success | error`.
3. **Define `FormAction`** — `SUBMIT_START | SUBMIT_SUCCESS | SUBMIT_ERROR | RESET`.
4. **Write `formReducer`** — handles each action, returns the new `FormState`.
5. **Replace the three `useState` calls** with `useReducer(formReducer, { status: 'idle' })`.
6. **Update the submit handler** — one `dispatch` per code path, no manual sync.
7. **Verify** — all three bugs are now structurally impossible.

---

## 💡 Gotchas

- **Keep `formData` as `useState`** — input values are independent of the submission state
  machine. Not everything needs to go in the reducer.
- **Action names should describe intent, not mechanics** — `SUBMIT_ERROR` is better than
  `SET_ERROR_MESSAGE`. Actions describe what happened, not which fields to update.
- **Don't put side effects in the reducer** — reducers must be pure. API calls, logging, and
  timers belong in the event handler, not in the `case` block.
- **`useReducer` with complex objects** — the reducer receives the whole state object, so you
  can read any field when computing the next state (useful for guards).

---

## 🔍 Reference

- [React docs: Extracting state logic into a reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer)
- [React docs: Choosing the state structure](https://react.dev/learn/choosing-the-state-structure)
- [Richard Feldman: Making Impossible States Impossible](https://www.youtube.com/watch?v=IcgmSRJHu_8)
