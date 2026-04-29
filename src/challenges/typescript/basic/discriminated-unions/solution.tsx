'use client';

/**
 * ✅ SOLUTION — Discriminated unions for impossible-state elimination
 *
 * Key insight: the `status` literal is the *discriminant* — TypeScript uses it
 * to determine which branch of the union is active and narrows all other fields
 * accordingly. Within `case 'success':`, TypeScript knows `state.data` exists
 * and is typed as `UserProfile`, not `UserProfile | undefined`.
 *
 * Why string literals over booleans?
 *   Booleans are only two values. Two booleans give 4 combinations (2×2), most
 *   of which are invalid. String literals give you exactly the branches you
 *   intend — no more, no less.
 *
 * Why `assertNever`?
 *   TypeScript tracks which union branches remain unhandled through a `switch`.
 *   If you add a fourth branch to `ApiState` and forget to add a `case`, TypeScript
 *   routes the unmatched branch into `default: assertNever(state)` — and since
 *   the new branch is not `never`, you get a compile error. Exhaustiveness for free.
 *
 * `Extract<T, { status: 'success' }>`:
 *   A utility-type narrowing shortcut. Equivalent to the matching union branch,
 *   but useful when you want to derive a type from the union programmatically
 *   (e.g., for type predicates or function return types).
 */

export interface UserProfile {
  id: number;
  name: string;
  email: string;
}

// Each branch has exactly the fields that make sense in that state.
// Data only exists on 'success'; error only exists on 'error'.
type ApiState =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'success'; data: UserProfile };

// Bottom type — reaching this is a compile-time error if the switch is non-exhaustive.
function assertNever(x: never): never {
  throw new Error(`Unhandled ApiState: ${JSON.stringify(x)}`);
}

function renderApiState(state: ApiState): string {
  switch (state.status) {
    case 'loading':
      return 'Loading…';
    case 'error':
      // TypeScript knows `state.error` is `string` here — not `string | undefined`.
      return `Error: ${state.error}`;
    case 'success':
      // TypeScript knows `state.data` is `UserProfile` here — no optional chaining needed.
      return `Hello, ${state.data.name}!`;
    default:
      // If you add a 4th branch above and forget a case here, TS errors on this line.
      return assertNever(state);
  }
}

// Four-branch form state — each branch carries exactly the data it needs.
type FormState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; redirectUrl: string }
  | { status: 'error'; fieldErrors: Record<string, string> };

function renderFormState(state: FormState): string {
  switch (state.status) {
    case 'idle': return 'Fill in the form and submit.';
    case 'submitting': return 'Submitting…';
    case 'success': return `Success! Redirecting to ${state.redirectUrl}`;
    case 'error': return `Errors: ${Object.keys(state.fieldErrors).join(', ')}`;
    default: return assertNever(state);
  }
}

export default function DiscriminatedUnionsSolution(): React.JSX.Element {
  const apiStates: ApiState[] = [
    { status: 'loading' },
    { status: 'error', error: 'Network timeout' },
    { status: 'success', data: { id: 1, name: 'Alice', email: 'alice@example.com' } },
  ];

  const formStates: FormState[] = [
    { status: 'idle' },
    { status: 'submitting' },
    { status: 'success', redirectUrl: '/dashboard' },
    { status: 'error', fieldErrors: { email: 'Invalid format', name: 'Required' } },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">Discriminated Unions</h2>
      <div className="space-y-2">
        <h3 className="text-sm font-medium">ApiState</h3>
        <ul className="space-y-1 rounded-md border p-3 text-sm">
          {apiStates.map((s, i) => (
            <li key={i}>
              <code className="mr-2 rounded bg-muted px-1">{s.status}</code>
              {renderApiState(s)}
            </li>
          ))}
        </ul>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium">FormState</h3>
        <ul className="space-y-1 rounded-md border p-3 text-sm">
          {formStates.map((s, i) => (
            <li key={i}>
              <code className="mr-2 rounded bg-muted px-1">{s.status}</code>
              {renderFormState(s)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
