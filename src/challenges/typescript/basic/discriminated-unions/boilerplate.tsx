'use client';

/**
 * 🚧 BOILERPLATE
 *
 * The `ApiState` type below uses boolean flags. This lets impossible combinations
 * exist (isLoading=true AND isSuccess=true at the same time).
 *
 * Your tasks:
 *  1. Replace `ApiState` with a discriminated union (status: 'loading' | 'error' | 'success').
 *  2. Implement `renderApiState` using a switch + assertNever for exhaustive checking.
 *  3. Model `FormState` as a four-branch union (idle / submitting / success / error).
 *
 * The `@ts-expect-error` annotations below are intentional — they mark
 * cases that MUST remain a compile error after your refactor.
 */

export interface UserProfile {
  id: number;
  name: string;
  email: string;
}

// ❌ TODO: replace with a discriminated union
interface ApiState {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  data?: UserProfile;
  error?: string;
}

// ❌ TODO: implement with exhaustive switch
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function renderApiState(_state: ApiState): string {
  return 'not implemented';
}

export default function DiscriminatedUnionsBoilerplate(): React.JSX.Element {
  const states: ApiState[] = [
    { isLoading: true, isError: false, isSuccess: false },
    { isLoading: false, isError: true, isSuccess: false, error: 'Network timeout' },
    { isLoading: false, isError: false, isSuccess: true, data: { id: 1, name: 'Alice', email: 'alice@example.com' } },
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold">Discriminated Unions</h2>
      <p className="text-sm text-muted-foreground">
        This challenge is type-level. Fix the types and watch the TS errors disappear
        (except the intentional <code className="rounded bg-muted px-1">@ts-expect-error</code> ones).
      </p>
      <ul className="space-y-1 rounded-md border p-3 text-sm">
        {states.map((s, i) => (
          <li key={i}>
            State {i + 1}: <code className="rounded bg-muted px-1">{renderApiState(s)}</code>
          </li>
        ))}
      </ul>
    </div>
  );
}
