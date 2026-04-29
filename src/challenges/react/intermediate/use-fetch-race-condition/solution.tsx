'use client';

/**
 * ✅ SOLUTION — Race-safe useFetch with AbortController
 *
 * Two mechanisms work together:
 *
 *  1. `AbortController` — each effect run creates a fresh controller. When the
 *     effect re-runs (because `query` changed), the cleanup function calls
 *     `controller.abort()`. This cancels the in-flight network request before
 *     the new one starts, so the stale response never arrives.
 *
 *  2. `AbortError` guard — when `abort()` is called, the fetch promise rejects
 *     with a DOMException whose `name` is "AbortError". We must NOT treat this
 *     as a real error — it's an expected, intentional cancellation.
 *
 * Why AbortController > ignore flag:
 *   An `ignored` boolean prevents stale state updates but still burns bandwidth —
 *   the network request runs to completion and the response body is downloaded.
 *   AbortController cancels at the browser level: the TCP connection may be
 *   recycled or not opened at all (for queued requests). In production this
 *   matters when requests are large or the user is on a metered connection.
 *
 * Why not React Query / SWR?
 *   Libraries like TanStack Query implement this pattern (plus deduplication,
 *   caching, background refetch, etc.). For new projects, prefer a library.
 *   Understanding the raw pattern makes you a better consumer of those libraries.
 */

import { useEffect, useState } from 'react';
import { searchDocs, type SearchResult } from './mock-api';

function useFetch(query: string): {
  data: SearchResult[];
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      setData([]);
      setError(null);
      return;
    }

    // Create a new controller for this effect invocation.
    // The cleanup function (returned below) will abort it when:
    //   a) The component unmounts, OR
    //   b) `query` changes and the effect re-runs.
    const controller = new AbortController();

    setLoading(true);
    setError(null);

    searchDocs(query, controller.signal)
      .then((results) => {
        console.log(`[fetch resolved] query="${query}", ${results.length} results`);
        setData(results);
        setLoading(false);
      })
      .catch((err: unknown) => {
        // AbortError is expected when a newer query supersedes this one.
        // Do NOT setError for it — the new request is already in flight.
        if (err instanceof Error && err.name === 'AbortError') {
          console.log(`[fetch aborted] query="${query}"`);
          return;
        }
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      });

    // Cleanup: abort the previous fetch before the next one starts.
    return () => {
      controller.abort();
    };
  }, [query]);

  return { data, loading, error };
}

export default function UseFetchRaceConditionSolution(): React.JSX.Element {
  const [query, setQuery] = useState('');
  const { data, loading, error } = useFetch(query);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="mb-1 text-base font-semibold">Doc Search (race-safe)</h2>
        <p className="text-xs text-muted-foreground">
          Type quickly — stale requests are aborted. Only the latest result lands.
        </p>
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type freely — no stale results"
        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <div className="min-h-[120px] rounded-md border p-3">
        {loading ? (
          <p className="text-xs text-muted-foreground">Searching…</p>
        ) : error ? (
          <p className="text-xs text-red-500">{error}</p>
        ) : data.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            {query ? 'No results.' : 'Start typing to search.'}
          </p>
        ) : (
          <ul className="space-y-1">
            {data.map((r) => (
              <li key={r.id} className="text-sm">
                {r.title}
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Current query: <code className="rounded bg-muted px-1">{query || '(empty)'}</code>
        {' · '}Results showing: <code className="rounded bg-muted px-1">{data.length}</code>
      </p>
    </div>
  );
}
