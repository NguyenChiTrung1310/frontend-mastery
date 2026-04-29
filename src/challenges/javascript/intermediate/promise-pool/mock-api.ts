export interface TaskResult {
  id: number;
  label: string;
  durationMs: number;
  ok: boolean;
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Creates a batch of fake tasks with random durations and an optional failure rate. */
export function createTasks(
  count: number,
  failRate = 0.15,
): Array<{ id: number; label: string; run: () => Promise<TaskResult> }> {
  return Array.from({ length: count }, (_, i) => {
    const id = i + 1;
    const durationMs = 300 + Math.floor(Math.random() * 700); // 300–1000ms
    const willFail = Math.random() < failRate;
    return {
      id,
      label: `Task #${String(id).padStart(2, '0')}`,
      run: async (): Promise<TaskResult> => {
        await delay(durationMs);
        if (willFail) throw new Error(`Task #${id} failed (simulated)`);
        return { id, label: `Task #${id}`, durationMs, ok: true };
      },
    };
  });
}
