export interface SearchResult {
  id: number;
  title: string;
  relevance: number;
}

const ITEMS = [
  'React hooks deep-dive',
  'React concurrent features',
  'React Server Components',
  'React Query patterns',
  'Redux toolkit basics',
  'Redux vs Zustand',
  'TypeScript generics',
  'TypeScript utility types',
  'Next.js App Router',
  'Next.js Server Actions',
  'useSyncExternalStore',
  'useTransition explained',
  'Debounce vs throttle',
  'Promise pool concurrency',
  'AbortController patterns',
  'Virtual DOM reconciliation',
  'Fiber architecture',
  'CSS-in-JS tradeoffs',
  'Tailwind best practices',
  'Testing React hooks',
];

// Intentionally jittered delays: short queries resolve slower than long ones
// so the race is easy to trigger by typing a few characters fast.
function latencyForQuery(query: string): number {
  if (query.length <= 1) return 350 + Math.random() * 200;
  if (query.length <= 3) return 200 + Math.random() * 150;
  return 50 + Math.random() * 80;
}

export async function searchDocs(
  query: string,
  signal?: AbortSignal,
): Promise<SearchResult[]> {
  const ms = latencyForQuery(query);

  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });

  const q = query.toLowerCase();
  return ITEMS.filter((t) => t.toLowerCase().includes(q)).map((title, i) => ({
    id: i,
    title,
    relevance: title.toLowerCase().indexOf(q),
  }));
}
