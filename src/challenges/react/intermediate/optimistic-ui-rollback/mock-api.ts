/**
 * Simulates a server that takes 1500ms to confirm a like.
 * Pass `fail: true` to trigger a rejection — used by the solution's failure-mode toggle.
 */
export function fakeLikePost(fail: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (fail) {
        reject(new Error('Server error: like failed'));
      } else {
        resolve();
      }
    }, 1500);
  });
}
