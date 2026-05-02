function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Simulates a form submission with an 800ms delay.
 * Rejects with a realistic error message when shouldFail is true.
 */
export async function fakeSubmit(shouldFail: boolean): Promise<void> {
  await delay(800);
  if (shouldFail) {
    throw new Error('Server validation failed');
  }
}
