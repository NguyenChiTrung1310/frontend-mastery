'use client';

/**
 * 🚧 BOILERPLATE
 *
 * `promisePool` below runs ALL tasks at once — it ignores the `concurrency` argument.
 * Your goal: make it run at most `concurrency` tasks in parallel.
 *
 * Hints:
 *  - Create `concurrency` "worker" async functions that each pull the next task.
 *  - Increment a shared index *before* awaiting to avoid two workers claiming the same task.
 *  - `Promise.all(workers)` waits for all K workers to drain the queue.
 *  - Wrap each task in try/catch so one failure doesn't kill a worker slot.
 */

import { useState } from 'react';
import { createTasks, type TaskResult } from './mock-api';

// ❌ TODO: respect the `concurrency` argument
async function promisePool<T>(
  tasks: Array<() => Promise<T>>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _concurrency: number,
): Promise<Array<{ value?: T; error?: string }>> {
  // ❌ This fires everything at once — no limit!
  const results = await Promise.allSettled(tasks.map((t) => t()));
  return results.map((r) =>
    r.status === 'fulfilled'
      ? { value: r.value }
      : { error: r.reason instanceof Error ? r.reason.message : String(r.reason) },
  );
}

interface TaskState {
  id: number;
  label: string;
  status: 'pending' | 'running' | 'done' | 'error';
  error?: string;
  result?: TaskResult;
}

export default function PromisePoolBoilerplate(): React.JSX.Element {
  const [concurrency, setConcurrency] = useState(3);
  const [taskCount, setTaskCount] = useState(12);
  const [states, setStates] = useState<TaskState[]>([]);
  const [running, setRunning] = useState(false);
  const [summary, setSummary] = useState('');

  const handleRun = async (): Promise<void> => {
    const tasks = createTasks(taskCount);
    const initial: TaskState[] = tasks.map((t) => ({ id: t.id, label: t.label, status: 'pending' }));
    setStates(initial);
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
        if (!r) return s;
        return r.error
          ? { ...s, status: 'error', error: r.error }
          : { ...s, status: s.status === 'running' ? 'done' : s.status };
      }),
    );

    const ok = results.filter((r) => !r.error).length;
    setSummary(`Done in ${elapsed}ms — ${ok}/${taskCount} succeeded`);
    setRunning(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">Promise Pool</h2>
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
