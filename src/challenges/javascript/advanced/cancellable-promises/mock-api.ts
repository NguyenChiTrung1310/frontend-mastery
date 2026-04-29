export interface ComputationProgress {
  step: number;
  total: number;
  label: string;
}

const STEPS = [
  'Initialising worker…',
  'Loading dataset…',
  'Running analysis (pass 1)…',
  'Running analysis (pass 2)…',
  'Aggregating results…',
  'Serialising output…',
  'Done.',
];

/**
 * Simulates a multi-step computation that respects AbortSignal.
 * Each step takes ~400ms. The signal is checked between steps.
 */
export async function heavyComputation(
  signal: AbortSignal,
  onProgress?: (p: ComputationProgress) => void,
): Promise<string> {
  for (let i = 0; i < STEPS.length; i++) {
    // Check before starting each step — bail early if already aborted.
    signal.throwIfAborted();

    const label = STEPS[i] ?? 'Working…';
    onProgress?.({ step: i + 1, total: STEPS.length, label });

    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, 400);
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(signal.reason instanceof Error ? signal.reason : new DOMException('Aborted', 'AbortError'));
      }, { once: true });
    });
  }
  return 'Analysis complete — 42 anomalies detected.';
}
