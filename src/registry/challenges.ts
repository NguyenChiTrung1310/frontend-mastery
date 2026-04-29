import type { ChallengeEntry, ChallengePath } from '@/lib/types';

// Markdown READMEs imported as raw strings via the webpack rule in next.config.mjs.
import renderOptimizationReadme from '@/challenges/react/advanced/render-optimization/README.md';
import debounceThrottleReadme from '@/challenges/javascript/basic/debounce-throttle/README.md';
import genericUtilityTypesReadme from '@/challenges/typescript/intermediate/generic-utility-types/README.md';
import streamingSuspenseReadme from '@/challenges/nextjs/advanced/streaming-suspense/README.md';
import lruCacheReadme from '@/challenges/dsa/intermediate/lru-cache/README.md';

/**
 * The registry is the single source of truth for all challenges.
 *
 * Why hardcoded over filesystem-scanning?
 * ----------------------------------------
 * 1. **Type safety** — every challenge is statically known, so typos surface at build time.
 * 2. **Bundling** — Next.js can only code-split via `import()` calls it can statically analyze.
 *    Dynamic `fs.readdir()` defeats route-level chunking.
 * 3. **Determinism** — adding a challenge is one explicit registry entry, not "drop a folder
 *    somewhere and pray it gets picked up". This pays dividends as the catalogue grows.
 *
 * Tradeoff: adding a challenge requires touching this file. We accept that — explicit > implicit.
 */
export const CHALLENGES: readonly ChallengeEntry[] = [
  {
    slug: 'render-optimization',
    title: 'Render Optimization with Concurrent Features',
    category: 'react',
    difficulty: 'advanced',
    description:
      'Tame a 10,000-item list using useTransition, useDeferredValue, and React.memo.',
    tags: ['concurrent', 'fiber', 'performance'],
    estimatedMinutes: 45,
    readme: renderOptimizationReadme as unknown as string,
    loaders: {
      boilerplate: () => import('@/challenges/react/advanced/render-optimization/boilerplate'),
      solution: () => import('@/challenges/react/advanced/render-optimization/solution'),
    },
  },
  {
    slug: 'debounce-throttle',
    title: 'Implement Debounce & Throttle',
    category: 'javascript',
    difficulty: 'basic',
    description: 'Build debounce and throttle utilities from scratch — no lodash allowed.',
    tags: ['closures', 'timers', 'utilities'],
    estimatedMinutes: 25,
    readme: debounceThrottleReadme as unknown as string,
    loaders: {
      boilerplate: () => import('@/challenges/javascript/basic/debounce-throttle/boilerplate'),
      solution: () => import('@/challenges/javascript/basic/debounce-throttle/solution'),
    },
  },
  {
    slug: 'generic-utility-types',
    title: 'Build Your Own Utility Types',
    category: 'typescript',
    difficulty: 'intermediate',
    description: 'Re-implement Pick, Omit, DeepPartial, and PromiseValue using conditional types.',
    tags: ['generics', 'conditional-types', 'mapped-types'],
    estimatedMinutes: 35,
    readme: genericUtilityTypesReadme as unknown as string,
    loaders: {
      boilerplate: () =>
        import('@/challenges/typescript/intermediate/generic-utility-types/boilerplate'),
      solution: () =>
        import('@/challenges/typescript/intermediate/generic-utility-types/solution'),
    },
  },
  {
    slug: 'streaming-suspense',
    title: 'Streaming SSR with Suspense',
    category: 'nextjs',
    difficulty: 'advanced',
    description:
      'Use Suspense boundaries and the App Router to stream slow data without blocking TTFB.',
    tags: ['app-router', 'suspense', 'rsc'],
    estimatedMinutes: 40,
    readme: streamingSuspenseReadme as unknown as string,
    loaders: {
      boilerplate: () => import('@/challenges/nextjs/advanced/streaming-suspense/boilerplate'),
      solution: () => import('@/challenges/nextjs/advanced/streaming-suspense/solution'),
    },
  },
  {
    slug: 'lru-cache',
    title: 'LRU Cache (O(1))',
    category: 'dsa',
    difficulty: 'intermediate',
    description: 'Implement an LRU cache with O(1) get and put using a doubly-linked list + map.',
    tags: ['hashmap', 'linked-list', 'design'],
    estimatedMinutes: 50,
    readme: lruCacheReadme as unknown as string,
    loaders: {
      boilerplate: () => import('@/challenges/dsa/intermediate/lru-cache/boilerplate'),
      solution: () => import('@/challenges/dsa/intermediate/lru-cache/solution'),
    },
  },
] as const;

/**
 * Look up a challenge by its full path triple. Returns `undefined` when not found —
 * the caller (route handler) is responsible for triggering a 404.
 */
export function findChallenge(path: ChallengePath): ChallengeEntry | undefined {
  return CHALLENGES.find(
    (c) =>
      c.category === path.category &&
      c.difficulty === path.difficulty &&
      c.slug === path.slug,
  );
}

/**
 * Group challenges for sidebar rendering. Memoized via module-level caching since
 * the registry is static at runtime.
 */
export function getGroupedChallenges(): Map<string, ChallengeEntry[]> {
  const map = new Map<string, ChallengeEntry[]>();
  for (const challenge of CHALLENGES) {
    const key = challenge.category;
    const list = map.get(key) ?? [];
    list.push(challenge);
    map.set(key, list);
  }
  return map;
}

/** Used by `generateStaticParams` to pre-render all known routes at build time. */
export function getAllChallengePaths(): ChallengePath[] {
  return CHALLENGES.map(({ category, difficulty, slug }) => ({ category, difficulty, slug }));
}
