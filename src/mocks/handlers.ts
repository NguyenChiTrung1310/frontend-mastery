import { http, HttpResponse, delay } from 'msw';

/**
 * Shared MSW handlers used across challenges. Individual challenges may also export
 * their own handlers from their `mock-api.ts` file and merge them at the worker
 * registration site.
 */
export const handlers = [
  // Generic slow endpoint — useful for Suspense / loading-state demos
  http.get('/api/slow', async ({ request }) => {
    const url = new URL(request.url);
    const ms = Number(url.searchParams.get('ms') ?? '1500');
    await delay(ms);
    return HttpResponse.json({ ok: true, waitedMs: ms });
  }),

  // Flaky endpoint for retry/error-handling practice
  http.get('/api/flaky', async () => {
    await delay(300);
    if (Math.random() < 0.5) {
      return HttpResponse.json({ error: 'Coin flip failed' }, { status: 500 });
    }
    return HttpResponse.json({ ok: true });
  }),
];
