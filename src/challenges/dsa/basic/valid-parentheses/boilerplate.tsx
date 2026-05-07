'use client';

/**
 * 🚧 BOILERPLATE
 *
 * Implement isValid(s: string): boolean using a stack.
 *
 * A string of brackets is valid if every opening bracket has a matching
 * closing bracket in the correct order. The LIFO property of a stack
 * maps perfectly to this constraint.
 *
 * Hints:
 *  - Push every opening bracket onto a stack.
 *  - On every closing bracket, pop the stack and check if it matches.
 *  - Use a MATCHING map: { ')': '(', ']': '[', '}': '{' }
 *  - After the loop, the stack must be empty (no unclosed opens).
 *  - Empty string → valid (loop body never runs).
 */

import { useState } from 'react';

// ─── inline UI primitives (Tailwind only — no @/components/ui imports) ───────

const Button = ({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
  >
    {children}
  </button>
);

const Badge = ({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: 'valid' | 'invalid';
}) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
      variant === 'valid'
        ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
        : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
    }`}
  >
    {children}
  </span>
);

// ─── stub — ❌ always returns true ────────────────────────────────────────────

// ❌ TODO: implement using a stack + MATCHING map
function isValid(_s: string): boolean {
  return true; // stub — wrong for any invalid input
}

// ─── test suite ───────────────────────────────────────────────────────────────

interface TestCase {
  input: string;
  expected: boolean;
  label: string;
}

const TEST_CASES: TestCase[] = [
  { input: '()', expected: true, label: '"()"' },
  { input: '()[]{}', expected: true, label: '"()[]{}"' },
  { input: '(]', expected: false, label: '"(]"' },
  { input: '([)]', expected: false, label: '"([)]"' },
  { input: '{[]}', expected: true, label: '"{[]}"' },
  { input: '', expected: true, label: '"" (empty)' },
];

interface LogEntry {
  msg: string;
  pass: boolean;
}

// ─── component ────────────────────────────────────────────────────────────────

export default function ValidParenthesesBoilerplate(): React.JSX.Element {
  const [input, setInput] = useState('([)]');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [ran, setRan] = useState(false);

  const liveResult = isValid(input);

  const runTests = () => {
    const entries: LogEntry[] = TEST_CASES.map(({ input: s, expected, label }) => {
      const got = isValid(s);
      const pass = got === expected;
      return {
        pass,
        msg: pass
          ? `✅ ${label} → expected ${String(expected)}, got ${String(got)}`
          : `❌ ${label} → expected ${String(expected)}, got ${String(got)}`,
      };
    });
    setLogs(entries);
    setRan(true);
  };

  return (
    <div className="space-y-5 p-1">
      {/* live input panel */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <p className="text-sm font-medium text-foreground">Live validator</p>
        <div className="flex items-center gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="type brackets…"
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Badge variant={liveResult ? 'valid' : 'invalid'}>
            {liveResult ? '✅ Valid' : '❌ Invalid'}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Try <code className="rounded bg-muted px-1">([)]</code> — the stub says ✅ Valid, which is clearly wrong.
        </p>
      </div>

      {/* run tests */}
      <Button onClick={runTests}>Run Tests</Button>

      {/* console panel */}
      {ran && (
        <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1 font-mono text-xs max-h-56 overflow-y-auto">
          {logs.map((entry, i) => (
            <p key={i} className={entry.pass ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              {entry.msg}
            </p>
          ))}
        </div>
      )}

      {/* status strip */}
      {ran && (
        <div className="flex gap-2 text-xs text-muted-foreground">
          <span>
            {logs.filter((l) => l.pass).length}/{logs.length} passed
          </span>
          {logs.some((l) => !l.pass) && (
            <span className="text-red-500">— implement isValid() above to fix failures</span>
          )}
        </div>
      )}
    </div>
  );
}
