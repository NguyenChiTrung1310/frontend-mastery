'use client';

/**
 * ✅ SOLUTION — Promise pool with concurrency limit
 *
 * The algorithm: spawn exactly `concurrency` "worker" coroutines. Each worker
 * grabs the next task index, runs it, and immediately loops to grab the next.
 * `Promise.all` resolves when all K workers have exhausted the queue.
 *
 * Why increment `i` *before* awaiting?
 *   If two workers both read `i === 5` before either increments it, they'd both
 *   run `tasks[5]`. The pre-increment (`const idx = i++`) is synchronous —
 *   it happens before any `await`, so no two workers can claim the same slot
 *   even with microtask interleaving. JavaScript is single-threaded: the
 *   increment and slot claim happen atomically.
 *
 * Why try/catch inside runNext?
 *   Without it, a task failure propagates up through `runNext`, which kills
 *   that worker entirely. The other K-1 workers keep running, but the failed
 *   slot is never refilled — your effective concurrency drops on every error.
 *   The catch stores the error and lets the worker loop continue.
 *
 * Complexity:
 *   Time  — O(n / k * avg_task_duration) — the optimal parallel schedule.
 *   Space — O(n) for the results array, O(k) worker frames on the call stack.
 */

import { useState } from 'react';
import { createTasks, type TaskResult } from './mock-api';

async function promisePool<T>(
  tasks: Array<() => Promise<T>>,
  concurrency: number,
): Promise<Array<{ value?: T; error?: string }>> {
  const results: Array<{ value?: T; error?: string }> = new Array(tasks.length);
  let i = 0; // shared counter — safe because JS is single-threaded

  async function runNext(): Promise<void> {
    while (i < tasks.length) {
      // Claim the next index synchronously (before any await) so no two workers
      // race for the same task.
      const idx = i++;
      try {
        const value = await tasks[idx]!();
        results[idx] = { value };
      } catch (err) {
        results[idx] = {
          error: err instanceof Error ? err.message : String(err),
        };
        // Don't re-throw — let this worker keep filling slots.
      }
    }
  }

  // Kick off exactly `concurrency` workers. They self-schedule via `while`.
  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, runNext));
  return results;
}

interface TaskState {
  id: number;
  label: string;
  status: 'pending' | 'running' | 'done' | 'error';
  error?: string;
  result?: TaskResult;
}

export default function PromisePoolSolution(): React.JSX.Element {
  const [concurrency, setConcurrency] = useState(3);
  const [taskCount, setTaskCount] = useState(12);
  const [states, setStates] = useState<TaskState[]>([]);
  const [running, setRunning] = useState(false);
  const [summary, setSummary] = useState('');

  const handleRun = async (): Promise<void> => {
    const tasks = createTasks(taskCount);
    setStates(tasks.map((t) => ({ id: t.id, label: t.label, status: 'pending' })));
    setSummary('');
    setRunning(true);

    const wrappedTasks = tasks.map((t) => async () => {
      setStates((prev) =>
        prev.map((s) => (s.id === t.id ? { ...s, status: 'running' } : s)),
      );
      const result = await t.run();
      setStates((prev) =>
        prev.map((s) => (s.id === t.id ? { ...s, status: 'done', result } : s)),
      );
      return result;
    });

    const start = Date.now();
    const results = await promisePool(wrappedTasks, concurrency);
    const elapsed = Date.now() - start;

    setStates((prev) =>
      prev.map((s) => {
        const r = results[s.id - 1];
        if (!r?.error) return s;
        return { ...s, status: 'error', error: r.error };
      }),
    );

    const ok = results.filter((r) => !r.error).length;
    setSummary(`Done in ${elapsed}ms — ${ok}/${taskCount} succeeded`);
    setRunning(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">Promise Pool (limited concurrency)</h2>
      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2">
          Tasks:
          <input
            type="number"
            min={1}
            max={30}
            value={taskCount}
            onChange={(e) => setTaskCount(Number(e.target.value))}
            className="w-16 rounded border px-2 py-1 text-center"
            disabled={running}
          />
        </label>
        <label className="flex items-center gap-2">
          Concurrency:
          <input
            type="number"
            min={1}
            max={taskCount}
            value={concurrency}
            onChange={(e) => setConcurrency(Number(e.target.value))}
            className="w-16 rounded border px-2 py-1 text-center"
            disabled={running}
          />
        </label>
        <button
          onClick={() => void handleRun()}
          disabled={running}
          className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground disabled:opacity-50"
        >
          {running ? 'Running…' : 'Run pool'}
        </button>
      </div>

      {states.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {states.map((s) => (
            <div
              key={s.id}
              className={`rounded border px-2 py-1.5 text-xs font-mono ${
                s.status === 'running'
                  ? 'border-blue-400 bg-blue-50 text-blue-700'
                  : s.status === 'done'
                    ? 'border-green-400 bg-green-50 text-green-700'
                    : s.status === 'error'
                      ? 'border-red-400 bg-red-50 text-red-700'
                      : 'border-muted text-muted-foreground'
              }`}
            >
              {s.label}{' '}
              {s.status === 'running' ? '⟳' : s.status === 'done' ? '✓' : s.status === 'error' ? '✗' : '·'}
            </div>
          ))}
        </div>
      ) : null}

      {summary ? <p className="text-sm font-medium">{summary}</p> : null}
    </div>
  );
}
