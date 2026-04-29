'use client';

/**
 * 🚧 BOILERPLATE
 *
 * `useFetch` below has a classic race condition: if two requests are in flight and
 * the earlier one resolves last, you'll display stale data.
 *
 * Try it: type "re" quickly, then "react". Watch the results flicker as
 * out-of-order responses land. The console shows arrival order.
 *
 * Hints:
 *  - The simplest fix: an `ignored` boolean set in the cleanup function.
 *  - The proper fix: pass an AbortController signal and abort on cleanup.
 *  - Distinguish AbortError from real errors — aborting is expected, not a failure.
 */

import { useEffect, useState } from 'react';
import { searchDocs, type SearchResult } from './mock-api';

// ❌ TODO: make this hook race-safe
function useFetch(query: string): { data: SearchResult[]; loading: boolean } {
  const [data, setData] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setData([]);
      return;
    }
    setLoading(true);
    // ❌ No cancellation — stale responses overwrite fresh ones
    searchDocs(query).then((results) => {
      console.log(`[fetch resolved] query="${query}", ${results.length} results`);
      setData(results);
      setLoading(false);
    });
  }, [query]);

  return { data, loading };
}

export default function UseFetchRaceConditionBoilerplate(): React.JSX.Element {
  const [query, setQuery] = useState('');
  const { data, loading } = useFetch(query);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="mb-1 text-base font-semibold">Doc Search</h2>
        <p className="text-xs text-muted-foreground">
          Type quickly — short queries are intentionally slower. Watch for stale results.
        </p>
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Try typing 're' then 'react' fast…"
        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <div className="min-h-[120px] rounded-md border p-3">
        {loading ? (
          <p className="text-xs text-muted-foreground">Searching…</p>
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
