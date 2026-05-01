'use client';

/**
 * ✅ SOLUTION — Server Actions form with useFormState + useFormStatus
 *
 * Three things replaced the entire useState/fetch boilerplate:
 *
 *  1. `useFormState(subscribeAction, initialState)` — wires the action to the form
 *     and tracks its return value as `state`. Each submission calls `subscribeAction`
 *     with the previous state and the submitted FormData. The result becomes the new
 *     state automatically — no `setError`, `setSuccess`, or `setLoading` needed.
 *
 *  2. `<form action={action}>` — the form submits via the browser's native mechanism
 *     (progressive enhancement). With JS, React intercepts and runs `subscribeAction`
 *     client-side. Without JS, the browser POSTs to the action URL as a normal form.
 *
 *  3. `useFormStatus()` in `SubmitButton` — reads the form's pending state from React
 *     context. It MUST be used in a component *inside* the `<form>` element — it won't
 *     work if placed in the same component as the `<form>` itself.
 *
 * Why move SubmitButton to a separate component?
 *   `useFormStatus` uses React context set by the form boundary. If you call it in
 *   the component that *renders* the form, the context hasn't been set yet for that
 *   render. Moving it one level down (a child of the form) ensures the context is
 *   available when the hook runs.
 *
 * What about controlled inputs?
 *   We dropped `value`/`onChange` entirely — the form now uses uncontrolled inputs.
 *   FormData reads field values by `name` attribute. This is strictly simpler and
 *   matches how HTML forms have always worked.
 */

import { useFormState, useFormStatus } from 'react-dom';
import { subscribeAction, type SubscribeState } from './mock-api';

const initialState: SubscribeState = {};

export default function ServerActionsFormSolution(): React.JSX.Element {
  // useFormState returns [currentState, wrappedAction].
  // Every time the form submits, `subscribeAction` is called and its return value
  // becomes the new `state`. No manual loading/error/success state needed.
  const [state, action] = useFormState(subscribeAction, initialState);

  if (state.success) {
    return (
      <div className="rounded-md border border-green-400 bg-green-50 p-4 text-sm text-green-700">
        ✓ You&apos;re subscribed at{' '}
        <strong>{state.email}</strong>! Check your inbox.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">Newsletter Signup (Server Action)</h2>
        <p className="text-sm text-muted-foreground">
          <code className="rounded bg-muted px-1">useFormState</code> +{' '}
          <code className="rounded bg-muted px-1">useFormStatus</code> — zero manual state.
        </p>
      </div>

      {/* `action` comes from useFormState — it wraps subscribeAction with state tracking. */}
      <form action={action} className="space-y-3">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email address
          </label>
          {/* Uncontrolled input — FormData reads it by `name`. */}
          <input
            id="email"
            name="email"
            type="text"
            placeholder="you@example.com"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {state.error ? (
          <p className="text-sm text-red-500" role="alert">
            {state.error}
          </p>
        ) : null}

        {/* SubmitButton is a separate component so useFormStatus works correctly. */}
        <SubmitButton />
      </form>

      <p className="text-xs text-muted-foreground">
        Try: <code className="rounded bg-muted px-1">taken@example.com</code> to see the duplicate error.
      </p>

      <div className="rounded-md border border-border bg-card p-4 space-y-3">
        <p className="text-sm font-semibold">✅ Why This Works</p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li><code className="rounded bg-muted px-1">useFormState</code> wires the action to the form and tracks its return value as state — no manual <code className="rounded bg-muted px-1">setLoading</code>, <code className="rounded bg-muted px-1">setError</code>, or <code className="rounded bg-muted px-1">setSuccess</code> needed.</li>
          <li><code className="rounded bg-muted px-1">useFormStatus</code> must live inside a child component of the form — it reads pending state from React context set by the form boundary.</li>
          <li>Inputs are uncontrolled — <code className="rounded bg-muted px-1">FormData</code> reads them by <code className="rounded bg-muted px-1">name</code> attribute, exactly like how HTML forms have always worked.</li>
        </ul>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-md border border-red-800 bg-red-950/40 p-3">
            <p className="text-xs font-semibold text-red-400 mb-2">❌ Before</p>
            <pre className="text-xs text-red-200 whitespace-pre-wrap">{`const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  // manual fetch, error handling...
};`}</pre>
          </div>
          <div className="rounded-md border border-green-800 bg-green-950/40 p-3">
            <p className="text-xs font-semibold text-green-400 mb-2">✅ After</p>
            <pre className="text-xs text-green-200 whitespace-pre-wrap">{`const [state, action] =
  useFormState(subscribeAction, {});
// state.error / state.success from action
<form action={action}>
  <SubmitButton /> {/* useFormStatus inside */}
</form>`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

// `useFormStatus` reads the pending state from the enclosing form context.
// It must live *inside* the form — hence a separate component.
function SubmitButton(): React.JSX.Element {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-primary py-2 text-sm text-primary-foreground disabled:opacity-50"
    >
      {pending ? 'Subscribing…' : 'Subscribe'}
    </button>
  );
}
