'use client';

/**
 * ✅ SOLUTION — useReducer with discriminated union state
 *
 * Three problems in the boilerplate are eliminated structurally:
 *
 * 1. "Forget to reset isSubmitting on error":
 *    `dispatch({ type: 'SUBMIT_ERROR', payload: msg })` transitions the entire
 *    state to `{ status: 'error', message: msg }`. There is no `isSubmitting`
 *    field to forget — it ceases to exist when the form leaves 'submitting'.
 *
 * 2. "Set isSuccess and errorMessage simultaneously":
 *    The FormState union has no variant that contains both a success signal AND
 *    a message. TypeScript will reject any attempt to create such a state at
 *    compile time, not just at runtime.
 *
 * 3. "Stale errorMessage when resubmitting":
 *    `dispatch({ type: 'SUBMIT_START' })` transitions to `{ status: 'submitting' }`.
 *    This variant has no `message` field, so the previous error is structurally
 *    gone — it cannot linger. No manual clearing is needed.
 *
 * Key insight: a reducer centralises ALL transitions in one function. Instead of
 * "call these 3 setters in the right order", you send a named intent and the
 * reducer owns all the consequences.
 */

import { useCallback, useReducer, useState } from 'react';
import { fakeSubmit } from './mock-api';

// ── Inline UI primitives (Tailwind only) ─────────────────────────────────────

const Card = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`rounded-lg border bg-card text-card-foreground p-4 ${className}`}>
    {children}
  </div>
);

const Badge = ({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'success' | 'muted' | 'warning';
}) => {
  const cls =
    variant === 'destructive'
      ? 'bg-destructive/20 text-destructive'
      : variant === 'success'
        ? 'bg-green-500/20 text-green-600 dark:text-green-400'
        : variant === 'warning'
          ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
          : variant === 'muted'
            ? 'bg-muted text-muted-foreground'
            : 'bg-secondary text-secondary-foreground';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}
    >
      {children}
    </span>
  );
};

const Button = ({
  children,
  onClick,
  disabled,
  variant = 'default',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'outline';
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
      variant === 'outline'
        ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
        : 'bg-primary text-primary-foreground hover:bg-primary/90'
    }`}
  >
    {children}
  </button>
);

// ── State types ────────────────────────────────────────────────────────────────

// ✅ Discriminated union: each status is mutually exclusive.
// There is no variant where `status: 'success'` and a `message` coexist.
// Impossible states are unrepresentable by construction.
type FormState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success' }
  | { status: 'error'; message: string }; // `message` only exists in error state

// ✅ Named actions describe WHAT happened, not WHICH field to update.
// Every transition is explicit and searchable.
type FormAction =
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_ERROR'; payload: string }
  | { type: 'RESET' };

// ✅ Pure function: all state transitions in one place.
// TypeScript enforces exhaustiveness — the compiler tells you if you miss a case.
function formReducer(_state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SUBMIT_START':
      // Transitioning to 'submitting' implicitly clears any previous error —
      // the 'submitting' variant has no `message` field.
      return { status: 'submitting' };
    case 'SUBMIT_SUCCESS':
      return { status: 'success' };
    case 'SUBMIT_ERROR':
      // `isSubmitting` is gone; `message` is always present in this variant.
      return { status: 'error', message: action.payload };
    case 'RESET':
      return { status: 'idle' };
  }
}

const initialState: FormState = { status: 'idle' };

// ── Types ─────────────────────────────────────────────────────────────────────

interface FormData {
  name: string;
  email: string;
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function UseReducerComplexStateSolution(): React.JSX.Element {
  // ✅ One useReducer replaces three useState calls.
  // `formState` is always in exactly one of: idle | submitting | success | error
  const [formState, dispatch] = useReducer(formReducer, initialState);

  // ✅ formData stays as useState — it's independent of the submission state machine
  const [formData, setFormData] = useState<FormData>({ name: '', email: '' });
  const [shouldFail, setShouldFail] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
  }, []);

  // ✅ Submit handler: one dispatch per code path — impossible to forget a field.
  function handleSubmit() {
    dispatch({ type: 'SUBMIT_START' }); // clears previous error structurally
    addLog('⏳ Submitting...');

    void (async () => {
      try {
        await fakeSubmit(shouldFail);
        dispatch({ type: 'SUBMIT_SUCCESS' }); // all three old setters in one call
        addLog('✅ Success!');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        dispatch({ type: 'SUBMIT_ERROR', payload: msg }); // isSubmitting reset is implicit
        addLog(`❌ Error: ${msg}`);
      }
    })();
  }

  function handleReset() {
    dispatch({ type: 'RESET' }); // one dispatch clears everything
    addLog('🔄 Reset');
  }

  // Derive display values from the single source of truth
  const isSubmitting = formState.status === 'submitting';
  const isSuccess = formState.status === 'success';
  const errorMessage = formState.status === 'error' ? formState.message : null;

  const statusDisplay = {
    idle: { icon: '📝', label: 'Ready to submit', cls: 'bg-muted/50 text-muted-foreground' },
    submitting: { icon: '⏳', label: 'Submitting…', cls: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    success: { icon: '✅', label: 'Submitted successfully!', cls: 'bg-green-500/10 text-green-600 dark:text-green-400' },
    error: { icon: '❌', label: errorMessage ?? '', cls: 'bg-destructive/10 text-destructive' },
  } as const;

  const sd = statusDisplay[formState.status];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">useReducer for Complex State</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Toggle &quot;Simulate server failure&quot; and submit — all transitions are clean.
          No impossible state is possible.
        </p>
      </div>

      {/* ── Form card ─────────────────────────────────────────────────────── */}
      <Card className="space-y-3">
        {/* Status banner */}
        <div className={`rounded-md px-3 py-2 text-sm font-medium ${sd.cls}`}>
          {sd.icon} {sd.label}
        </div>

        {/* Inputs */}
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Your name"
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            disabled={isSubmitting}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
          <input
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
            disabled={isSubmitting}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
        </div>

        {/* Controls */}
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={shouldFail}
            onChange={e => setShouldFail(e.target.checked)}
            className="rounded"
          />
          Simulate server failure
        </label>

        <div className="flex gap-2">
          <Button disabled={isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? '⏳ Submitting…' : 'Submit Form'}
          </Button>
          {(isSuccess || errorMessage !== null || isSubmitting) && (
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
          )}
        </div>
      </Card>

      {/* ── Disabled Bug Injector ──────────────────────────────────────────── */}
      <Card className="space-y-2 opacity-60">
        <p className="text-sm font-semibold">🐛 Bug Injector</p>
        <div className="rounded-md border border-green-700/30 bg-green-500/10 p-3 text-xs text-green-600 dark:text-green-400">
          🛡️ <strong>Bug injection disabled.</strong> The discriminated union type makes all
          three bugs structurally unrepresentable — the TypeScript compiler prevents them at
          compile time, not just at runtime.
        </div>
        {/* Buttons shown grayed-out to contrast with the boilerplate */}
        <div className="space-y-2 pointer-events-none select-none">
          {[
            'Bug 1: isSubmitting is gone — no field to forget (status transitions atomically)',
            'Bug 2: No variant has both success semantics and a message field',
            'Bug 3: SUBMIT_START transition has no message field — stale error vanishes',
          ].map((label, i) => (
            <div
              key={i}
              className="w-full rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground"
            >
              <span className="font-mono font-semibold">[ OFF]</span> {label}
            </div>
          ))}
        </div>
      </Card>

      {/* ── Event log ─────────────────────────────────────────────────────── */}
      <div className="rounded-md border bg-muted/30 p-3 font-mono text-xs max-h-48 overflow-y-auto space-y-1">
        {logs.length === 0 ? (
          <p className="text-muted-foreground">No events yet… submit the form to start</p>
        ) : (
          logs.map((log, i) => <p key={i}>{log}</p>)
        )}
      </div>

      {/* ── Status badge strip ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 pt-2 border-t">
        {/* ✅ One status field instead of three booleans */}
        <Badge variant={isSubmitting ? 'warning' : 'muted'}>
          status: {formState.status}
        </Badge>
        {formState.status === 'error' && (
          <Badge variant="destructive">message: &quot;{formState.message}&quot;</Badge>
        )}
        <Badge variant="success">✅ No impossible state possible</Badge>
      </div>

      {/* ── Explanation card ───────────────────────────────────────────────── */}
      <Card className="space-y-3">
        <p className="text-sm font-semibold">✅ Why This Works</p>
        <ul className="space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
          <li>
            Multiple <code className="rounded bg-muted px-1">setState</code> calls that must
            change together belong in a reducer — one{' '}
            <code className="rounded bg-muted px-1">dispatch</code> per code path makes it
            impossible to forget updating a field.
          </li>
          <li>
            Reducer actions are explicit intents (<code className="rounded bg-muted px-1">SUBMIT_ERROR</code>)
            rather than low-level mutations (<code className="rounded bg-muted px-1">setIsSubmitting(false)</code>) —
            every transition is named, traceable, and testable in isolation.
          </li>
          <li>
            A discriminated union state makes impossible combinations unrepresentable: there is
            no <code className="rounded bg-muted px-1">FormState</code> variant that holds both
            success semantics and an error message — the TypeScript compiler rejects it.
          </li>
        </ul>

        {/* Before / after code panel */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="rounded-md border border-red-800 bg-red-950/40 p-3">
            <p className="text-xs font-semibold text-red-400 mb-2">❌ Before</p>
            <pre className="text-xs text-red-200 whitespace-pre-wrap">{`// On error — easy to miss one
setIsSubmitting(false); // forget?
setErrorMessage(msg);
// isSuccess still true? Maybe.

// On resubmit — must clear manually
setErrorMessage(''); // forget?
setIsSuccess(false); // forget?
setIsSubmitting(true);`}</pre>
          </div>
          <div className="rounded-md border border-green-800 bg-green-950/40 p-3">
            <p className="text-xs font-semibold text-green-400 mb-2">✅ After</p>
            <pre className="text-xs text-green-200 whitespace-pre-wrap">{`// On error — one call, all sync
dispatch({
  type: 'SUBMIT_ERROR',
  payload: msg,
});

// On resubmit — atomic transition
// 'submitting' state has no message
// field — stale error vanishes
dispatch({ type: 'SUBMIT_START' });`}</pre>
          </div>
        </div>
      </Card>
    </div>
  );
}
