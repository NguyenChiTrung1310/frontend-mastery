'use client';

/**
 * 🚧 BOILERPLATE
 *
 * A working newsletter signup form — but it's 100% client-driven:
 *  - useState for field, loading, error, and success
 *  - Manual fetch + e.preventDefault()
 *  - No progressive enhancement (broken without JS)
 *
 * Your goal: rewrite using `useFormState` + `useFormStatus` from 'react-dom'.
 *
 * Hints:
 *  - `import { useFormState, useFormStatus } from 'react-dom'`
 *  - useFormState(subscribeAction, initialState) → [state, action]
 *  - Pass `action` to `<form action={action}>`
 *  - Move the submit button to a child component and use `useFormStatus` there.
 *  - In the submit button: `const { pending } = useFormStatus()`
 */

import { useState } from 'react';
import { subscribeAction } from './mock-api';

export default function ServerActionsFormBoilerplate(): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // ❌ Manual fetch — no progressive enhancement, lots of state boilerplate
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set('email', email);

    try {
      const result = await subscribeAction({}, formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-md border border-green-400 bg-green-50 p-4 text-sm text-green-700">
        ✓ You&apos;re subscribed! Check your inbox.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">Newsletter Signup</h2>
        <p className="text-sm text-muted-foreground">
          Refactor this form to use <code className="rounded bg-muted px-1">useFormState</code> +{' '}
          <code className="rounded bg-muted px-1">useFormStatus</code>.
        </p>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={loading}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
        </div>

        {error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : null}

        {/* ❌ Try: taken@example.com or used@test.com to see the duplicate error */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-primary py-2 text-sm text-primary-foreground disabled:opacity-50"
        >
          {loading ? 'Subscribing…' : 'Subscribe'}
        </button>
      </form>

      <p className="text-xs text-muted-foreground">
        Try: <code className="rounded bg-muted px-1">taken@example.com</code> to see the duplicate error.
      </p>
    </div>
  );
}
