'use client';

/**
 * ✅ SOLUTION — Valid Parentheses with a stack
 *
 * The core insight: bracket nesting is LIFO — the most recently opened bracket
 * must close next. A stack enforces exactly that.
 *
 * Algorithm:
 *   1. Walk every character.
 *   2. Opening bracket → push onto stack.
 *   3. Closing bracket → pop the stack. If the popped value doesn't equal
 *      MATCHING[char] (or the stack was empty), the string is invalid.
 *   4. After the loop: valid iff the stack is empty (no unclosed opens).
 *
 * MATCHING maps each closing bracket to its expected opening bracket.
 * This direction (close → open) lets us check at close-time rather than
 * carrying state about which bracket was pushed.
 *
 * Time: O(n) — one pass through the string.
 * Space: O(n) — worst case all opening brackets are pushed (e.g. "((((").
 */

import { useState } from 'react';

// ─── inline UI primitives (Tailwind only) ─────────────────────────────────────

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

// ─── solution ─────────────────────────────────────────────────────────────────

// Maps each closing bracket to its expected opening counterpart.
const MATCHING: Record<string, string> = { ')': '(', ']': '[', '}': '{' };

function isOpen(c: string): boolean {
  return c === '(' || c === '[' || c === '{';
}

function isValid(s: string): boolean {
  const stack: string[] = [];

  for (const c of s) {
    if (isOpen(c)) {
      // Push opening brackets — we'll match them when the close arrives.
      stack.push(c);
    } else {
      // Closing bracket: the most recently pushed open must match.
      // stack.pop() returns undefined if empty — that also means invalid.
      if (stack.pop() !== MATCHING[c]) return false;
    }
  }

  // Non-empty stack means unclosed opens remain.
  return stack.length === 0;
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

export default function ValidParenthesesSolution(): React.JSX.Element {
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
      {/* live input panel — same shape as boilerplate */}
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
          Try <code className="rounded bg-muted px-1">([)]</code> — now correctly shows ❌ Invalid.
        </p>
      </div>

      <Button onClick={runTests}>Run Tests</Button>

      {ran && (
        <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1 font-mono text-xs max-h-56 overflow-y-auto">
          {logs.map((entry, i) => (
            <p key={i} className={entry.pass ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              {entry.msg}
            </p>
          ))}
        </div>
      )}

      {ran && (
        <div className="flex gap-2 text-xs text-muted-foreground">
          <span>{logs.filter((l) => l.pass).length}/{logs.length} passed</span>
        </div>
      )}

      {/* explanation card */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <p className="text-sm font-semibold text-foreground">✅ Why This Works</p>
        <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
          <li>
            <strong>LIFO:</strong> the most recently opened bracket must close next — exactly what a stack enforces. Pushing opens and popping on closes models this directly.
          </li>
          <li>
            <strong>Pop on every close:</strong> if the stack is empty (no open to match) or the top doesn&apos;t equal <code className="rounded bg-muted px-1">MATCHING[char]</code>, return <code className="rounded bg-muted px-1">false</code> immediately.
          </li>
          <li>
            <strong>Non-empty stack at end</strong> means unclosed opens remain — also invalid. Empty string passes trivially because the loop body never runs.
          </li>
        </ul>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-md border border-red-800 bg-red-950/40 p-3">
            <p className="text-xs font-semibold text-red-400 mb-2">❌ Before</p>
            <pre className="text-xs text-red-200 whitespace-pre-wrap">{`function isValid(s: string) {
  return true; // always wrong
}`}</pre>
          </div>
          <div className="rounded-md border border-green-800 bg-green-950/40 p-3">
            <p className="text-xs font-semibold text-green-400 mb-2">✅ After</p>
            <pre className="text-xs text-green-200 whitespace-pre-wrap">{`for (const c of s) {
  if (isOpen(c)) stack.push(c);
  else if (stack.pop() !== MATCHING[c])
    return false;
}
return stack.length === 0;`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
