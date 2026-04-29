# Forms with Server Actions

## 🎯 Scenario

You have a newsletter signup form. The current implementation uses `useState` to track field values, a manual `fetch('/api/subscribe')` on submit, and a custom loading spinner wired to another state variable. It works — but it's 60 lines of client code, doesn't degrade without JavaScript, and duplicates validation logic.

Your job: rewrite it using **Server Actions** with `useFormState` and `useFormStatus` so the logic lives on the server, the loading state is automatic, and the form submits even without JS.

---

## 📂 Files

- `boilerplate.tsx` — A working client-only form. Edit this.
- `solution.tsx` — The Server Action version with progressive enhancement.
- `mock-api.ts` — A `subscribeAction` function that simulates server-side validation.

---

## ❓ Why This Matters

### The Problem with `fetch` + `useState`

```tsx
const [loading, setLoading] = useState(false);
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  await fetch('/api/subscribe', { method: 'POST', body: ... });
  setLoading(false);
};
```

Problems:
1. **JS-only** — `e.preventDefault()` means zero functionality without JavaScript.
2. **Duplicated validation** — client AND server must both validate.
3. **Boilerplate** — separate state for loading, error, success on every form.
4. **Not type-safe** — the fetch body is `any`.

### The Server Action Model

```tsx
// server action (can be a separate file with 'use server')
async function subscribe(prevState: FormState, data: FormData): Promise<FormState> {
  const email = data.get('email');
  if (!isValid(email)) return { error: 'Invalid email' };
  await saveToDb(email);
  return { success: true };
}

// component
const [state, action] = useFormState(subscribe, { error: null, success: false });
```

`useFormState` wires the action to the form's `action` attribute — the form works as a plain HTML form (progressive enhancement) or with JS for instant feedback.

---

## 🧠 Key Hooks

### `useFormState(action, initialState)`

- Wraps a Server Action and returns `[currentState, wrappedAction]`.
- `currentState` is the return value of the last action invocation.
- Works with `<form action={wrappedAction}>`.

### `useFormStatus()`

- Must be used in a **child** of the `<form>` element.
- Returns `{ pending: boolean }` — true while the form action is running.
- Use it to disable the submit button during submission.

---

## ✅ Tasks

### Task 1 — Wire up `useFormState`

Replace the `useState` + `fetch` pattern with `useFormState`. The action function signature must be:

```ts
async function subscribeAction(
  prevState: SubscribeState,
  formData: FormData,
): Promise<SubscribeState>
```

### Task 2 — Pending state with `useFormStatus`

Move the submit button into its own `SubmitButton` component and use `useFormStatus` to show "Subscribing…" while pending.

### Task 3 — Server-side validation

Add validation in the action for:
- Empty email
- Invalid email format (no `@`)
- Simulated duplicate email (check against a hardcoded set)

Return `{ error: string }` for failures, `{ success: true }` for success.

### Task 4 — Bonus: Optimistic UI

Wrap the action in `useOptimistic` to show a positive result immediately while the action runs, rolling back on failure.

---

## 💡 Gotchas

- **`useFormStatus` must be inside the form** — it reads from a React context set by the form. If you use it in the same component that renders the `<form>`, it won't see the pending state.
- **`useFormState` is from `react-dom`** — not `react`. (In React 19 it moves to `useActionState` from `react`.)
- **Server Actions need `'use server'`** — in this challenge, `mock-api.ts` simulates the server action as a regular async function. In a real app, the action file would start with `'use server'`.
- **`FormData.get()` returns `FormDataEntryValue | null`** — always narrow before use.

---

## 🔍 Reference

- [Next.js docs: Server Actions and Mutations](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [React docs: useFormStatus](https://react.dev/reference/react-dom/hooks/useFormStatus)
- [React docs: useFormState](https://react.dev/reference/react-dom/hooks/useFormState)
