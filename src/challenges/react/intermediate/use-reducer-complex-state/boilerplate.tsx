'use client';

/**
 * 🚧 BOILERPLATE
 *
 * This form uses 3 separate useState calls that must stay in sync:
 * isSubmitting, isSuccess, and errorMessage. Each submit path must
 * update all three — skip one and the UI shows an impossible state.
 *
 * Try it:
 *   1. Enable Bug 1 → submit with "Simulate failure" → button gets stuck forever
 *   2. Enable Bug 2 → submit successfully → success AND error appear at the same time
 *   3. Enable Bug 3 → fail once → submit again → stale error persists during loading
 *
 * Hints:
 *  - Replace the 3 marked useState calls with useReducer + a discriminated union type.
 *  - Type: { status: 'idle' } | { status: 'submitting' } | { status: 'success' } |
 *          { status: 'error'; message: string }
 *  - Actions: SUBMIT_START, SUBMIT_SUCCESS, SUBMIT_ERROR, RESET
 *  - One dispatch per code path — impossible to forget a field.
 */

import { useCallback, useEffect, useState } from 'react';
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
  type = 'button',
  disabled,
  variant = 'default',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'destructive';
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
      variant === 'outline'
        ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
        : variant === 'destructive'
          ? 'bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/30'
          : 'bg-primary text-primary-foreground hover:bg-primary/90'
    }`}
  >
    {children}
  </button>
);

// ── Types ─────────────────────────────────────────────────────────────────────

interface FormData {
  name: string;
  email: string;
}

interface BugFlags {
  bug1NoResetOnError: boolean;
  bug2ImpossibleState: boolean;
  bug3StaleError: boolean;
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function UseReducerComplexStateBoilerplate(): React.JSX.Element {
  // ── ❌ The problem: 3 state variables that must always change together ──────
  // Any code path that doesn't update ALL THREE can leave the UI inconsistent.
  // ❌ TODO: Replace these three with useReducer + a discriminated union type.
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // ── ✅ These two are fine as useState — they're independent ─────────────────
  const [formData, setFormData] = useState<FormData>({ name: '', email: '' });
  const [shouldFail, setShouldFail] = useState(false);

  // ── Infrastructure (not the challenge focus) ─────────────────────────────
  const [bugs, setBugs] = useState<BugFlags>({
    bug1NoResetOnError: false,
    bug2ImpossibleState: false,
    bug3StaleError: false,
  });
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
  }, []);

  // Detect and log impossible state when both isSuccess and errorMessage are truthy
  const impossibleState = isSuccess && errorMessage !== '';
  useEffect(() => {
    if (impossibleState) {
      addLog('🚨 Impossible state: isSuccess=true AND errorMessage is set simultaneously!');
    }
  }, [impossibleState, addLog]);

  // ── Submit handler — must keep isSubmitting, isSuccess, errorMessage in sync ──
  function handleSubmit() {
    // Bug 3: Should clear stale errorMessage before starting a new submission
    if (!bugs.bug3StaleError) {
      setErrorMessage('');
    } else if (errorMessage) {
      addLog(`⚠️ Bug 3: Stale error "${errorMessage}" still visible — not cleared before resubmit!`);
    }
    setIsSuccess(false);
    setIsSubmitting(true);
    addLog('⏳ Submitting...');

    void (async () => {
      try {
        await fakeSubmit(shouldFail);

        // ❌ On success: must remember to setIsSubmitting(false) AND setIsSuccess(true)
        setIsSubmitting(false);
        setIsSuccess(true);
        addLog('✅ Success!');

        // Bug 2: Inject impossible state — set errorMessage while isSuccess=true
        if (bugs.bug2ImpossibleState) {
          setErrorMessage('Phantom error — should not coexist with success!');
          addLog('⚠️ Bug 2: setErrorMessage() called while isSuccess=true!');
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';

        // Bug 1: Forget to reset isSubmitting — form gets stuck loading forever
        if (!bugs.bug1NoResetOnError) {
          setIsSubmitting(false);
        } else {
          addLog('⚠️ Bug 1: setIsSubmitting(false) skipped in catch — form is now stuck!');
        }

        // ❌ On error: must remember to setIsSubmitting(false) AND setErrorMessage()
        setErrorMessage(msg);
        addLog(`❌ Error: ${msg}`);
      }
    })();
  }

  function handleReset() {
    // ❌ Must remember to reset ALL THREE — easy to miss one
    setIsSubmitting(false);
    setIsSuccess(false);
    setErrorMessage('');
    addLog('🔄 Reset');
  }

  // Derived status for display
  const status = impossibleState
    ? 'impossible'
    : isSubmitting
      ? 'submitting'
      : isSuccess
        ? 'success'
        : errorMessage
          ? 'error'
          : 'idle';

  const statusDisplay = {
    idle: { icon: '📝', label: 'Ready to submit', cls: 'bg-muted/50 text-muted-foreground' },
    submitting: { icon: '⏳', label: 'Submitting…', cls: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    success: { icon: '✅', label: 'Submitted successfully!', cls: 'bg-green-500/10 text-green-600 dark:text-green-400' },
    error: { icon: '❌', label: errorMessage, cls: 'bg-destructive/10 text-destructive' },
    impossible: { icon: '🚨', label: 'IMPOSSIBLE STATE — success + error simultaneously!', cls: 'bg-destructive text-destructive-foreground' },
  } as const;

  const sd = statusDisplay[status];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">useReducer for Complex State</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Enable bugs in the injector below, then submit the form to see impossible states.
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
          {(isSuccess || errorMessage !== '' || isSubmitting) && (
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
          )}
        </div>
      </Card>

      {/* ── Impossible state alert ─────────────────────────────────────────── */}
      {impossibleState && (
        <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive leading-relaxed">
          <p className="font-semibold">🚨 Impossible state detected!</p>
          <p className="text-xs mt-1">
            <code className="rounded bg-destructive/20 px-1">isSuccess=true</code> AND{' '}
            <code className="rounded bg-destructive/20 px-1">
              errorMessage=&quot;{errorMessage}&quot;
            </code>{' '}
            are both set simultaneously. With separate useState calls, nothing prevents this.
          </p>
        </div>
      )}

      {/* ── Bug Injector ───────────────────────────────────────────────────── */}
      <Card className="space-y-2">
        <p className="text-sm font-semibold">🐛 Bug Injector</p>
        <p className="text-xs text-muted-foreground">
          Toggle bugs to introduce broken state transitions in the submit handler.
        </p>

        <div className="space-y-2 pt-1">
          {/* Bug 1 */}
          <button
            onClick={() => setBugs(b => ({ ...b, bug1NoResetOnError: !b.bug1NoResetOnError }))}
            className={`w-full rounded-md border px-3 py-2 text-xs text-left transition-colors ${
              bugs.bug1NoResetOnError
                ? 'border-destructive/50 bg-destructive/10 text-destructive'
                : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/60'
            }`}
          >
            <span className="font-mono font-semibold">
              {bugs.bug1NoResetOnError ? '[🐛 ON]' : '[ OFF]'}
            </span>{' '}
            Bug 1: Forget <code>setIsSubmitting(false)</code> on error → form stuck loading
          </button>

          {/* Bug 2 */}
          <button
            onClick={() => setBugs(b => ({ ...b, bug2ImpossibleState: !b.bug2ImpossibleState }))}
            className={`w-full rounded-md border px-3 py-2 text-xs text-left transition-colors ${
              bugs.bug2ImpossibleState
                ? 'border-destructive/50 bg-destructive/10 text-destructive'
                : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/60'
            }`}
          >
            <span className="font-mono font-semibold">
              {bugs.bug2ImpossibleState ? '[🐛 ON]' : '[ OFF]'}
            </span>{' '}
            Bug 2: Set <code>isSuccess=true</code> AND <code>errorMessage</code> simultaneously
          </button>

          {/* Bug 3 */}
          <button
            onClick={() => setBugs(b => ({ ...b, bug3StaleError: !b.bug3StaleError }))}
            className={`w-full rounded-md border px-3 py-2 text-xs text-left transition-colors ${
              bugs.bug3StaleError
                ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/60'
            }`}
          >
            <span className="font-mono font-semibold">
              {bugs.bug3StaleError ? '[🐛 ON]' : '[ OFF]'}
            </span>{' '}
            Bug 3: Skip <code>setErrorMessage(&apos;&apos;)</code> on resubmit → stale error persists
          </button>
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
        <Badge variant={isSubmitting ? 'warning' : 'muted'}>
          isSubmitting: {String(isSubmitting)}
        </Badge>
        <Badge variant={isSuccess ? 'success' : 'muted'}>isSuccess: {String(isSuccess)}</Badge>
        <Badge variant={errorMessage ? 'destructive' : 'muted'}>
          errorMessage: &quot;{errorMessage || '(empty)'}&quot;
        </Badge>
        {impossibleState && (
          <Badge variant="destructive">🚨 Impossible state active!</Badge>
        )}
      </div>
    </div>
  );
}
