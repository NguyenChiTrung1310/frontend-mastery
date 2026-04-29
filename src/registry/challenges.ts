import type { ChallengeEntry, ChallengePath } from '@/lib/types';

// Markdown READMEs imported as raw strings via the webpack rule in next.config.mjs.
import renderOptimizationReadme from '@/challenges/react/advanced/render-optimization/README.md';
import debounceThrottleReadme from '@/challenges/javascript/basic/debounce-throttle/README.md';
import genericUtilityTypesReadme from '@/challenges/typescript/intermediate/generic-utility-types/README.md';
import streamingSuspenseReadme from '@/challenges/nextjs/advanced/streaming-suspense/README.md';
import lruCacheReadme from '@/challenges/dsa/intermediate/lru-cache/README.md';
import useFetchRaceConditionReadme from '@/challenges/react/intermediate/use-fetch-race-condition/README.md';
import useSyncExternalStoreReadme from '@/challenges/react/advanced/use-sync-external-store/README.md';
import promisePoolReadme from '@/challenges/javascript/intermediate/promise-pool/README.md';
import cancellablePromisesReadme from '@/challenges/javascript/advanced/cancellable-promises/README.md';
import discriminatedUnionsReadme from '@/challenges/typescript/basic/discriminated-unions/README.md';
import typedEventEmitterReadme from '@/challenges/typescript/intermediate/typed-event-emitter/README.md';
import serverActionsFormReadme from '@/challenges/nextjs/intermediate/server-actions-form/README.md';
import fetchCachingStrategiesReadme from '@/challenges/nextjs/intermediate/fetch-caching-strategies/README.md';
import trieAutocompleteReadme from '@/challenges/dsa/intermediate/trie-autocomplete/README.md';
import treeDiffReadme from '@/challenges/dsa/advanced/tree-diff/README.md';

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
  {
    slug: 'use-fetch-race-condition',
    title: 'Race-Safe useFetch Hook',
    category: 'react',
    difficulty: 'intermediate',
    description: 'Build useFetch that survives rapid prop changes without showing stale data.',
    tags: ['hooks', 'async', 'abort-controller'],
    estimatedMinutes: 30,
    readme: useFetchRaceConditionReadme as unknown as string,
    loaders: {
      boilerplate: () => import('@/challenges/react/intermediate/use-fetch-race-condition/boilerplate'),
      solution: () => import('@/challenges/react/intermediate/use-fetch-race-condition/solution'),
    },
  },
  {
    slug: 'use-sync-external-store',
    title: 'Subscribe to Browser APIs with useSyncExternalStore',
    category: 'react',
    difficulty: 'advanced',
    description: 'Track window size, online status, and matchMedia without tearing.',
    tags: ['hooks', 'concurrent', 'external-store'],
    estimatedMinutes: 40,
    readme: useSyncExternalStoreReadme as unknown as string,
    loaders: {
      boilerplate: () => import('@/challenges/react/advanced/use-sync-external-store/boilerplate'),
      solution: () => import('@/challenges/react/advanced/use-sync-external-store/solution'),
    },
  },
  {
    slug: 'promise-pool',
    title: 'Promise Pool with Concurrency Limit',
    category: 'javascript',
    difficulty: 'intermediate',
    description: 'Run N async tasks at most K in parallel — backpressure for API calls.',
    tags: ['promises', 'async', 'concurrency'],
    estimatedMinutes: 35,
    readme: promisePoolReadme as unknown as string,
    loaders: {
      boilerplate: () => import('@/challenges/javascript/intermediate/promise-pool/boilerplate'),
      solution: () => import('@/challenges/javascript/intermediate/promise-pool/solution'),
    },
  },
  {
    slug: 'cancellable-promises',
    title: 'Cancellable Promises with AbortController',
    category: 'javascript',
    difficulty: 'advanced',
    description: 'Wrap fetch and arbitrary work units so they cancel cleanly on unmount.',
    tags: ['promises', 'abort-controller', 'async'],
    estimatedMinutes: 40,
    readme: cancellablePromisesReadme as unknown as string,
    loaders: {
      boilerplate: () => import('@/challenges/javascript/advanced/cancellable-promises/boilerplate'),
      solution: () => import('@/challenges/javascript/advanced/cancellable-promises/solution'),
    },
  },
  {
    slug: 'discriminated-unions',
    title: 'Model State with Discriminated Unions',
    category: 'typescript',
    difficulty: 'basic',
    description: 'Refactor boolean-flag state into a tagged union — make impossible states impossible.',
    tags: ['unions', 'narrowing', 'type-safety'],
    estimatedMinutes: 25,
    readme: discriminatedUnionsReadme as unknown as string,
    loaders: {
      boilerplate: () => import('@/challenges/typescript/basic/discriminated-unions/boilerplate'),
      solution: () => import('@/challenges/typescript/basic/discriminated-unions/solution'),
    },
  },
  {
    slug: 'typed-event-emitter',
    title: 'Type-safe Event Emitter',
    category: 'typescript',
    difficulty: 'intermediate',
    description: 'Build an emitter where event names map to typed payloads at compile time.',
    tags: ['generics', 'mapped-types', 'design-patterns'],
    estimatedMinutes: 40,
    readme: typedEventEmitterReadme as unknown as string,
    loaders: {
      boilerplate: () => import('@/challenges/typescript/intermediate/typed-event-emitter/boilerplate'),
      solution: () => import('@/challenges/typescript/intermediate/typed-event-emitter/solution'),
    },
  },
  {
    slug: 'server-actions-form',
    title: 'Forms with Server Actions',
    category: 'nextjs',
    difficulty: 'intermediate',
    description: 'Progressive-enhanced form using useFormState, useFormStatus, and server-side validation.',
    tags: ['server-actions', 'forms', 'app-router'],
    estimatedMinutes: 35,
    readme: serverActionsFormReadme as unknown as string,
    loaders: {
      boilerplate: () => import('@/challenges/nextjs/intermediate/server-actions-form/boilerplate'),
      solution: () => import('@/challenges/nextjs/intermediate/server-actions-form/solution'),
    },
  },
  {
    slug: 'fetch-caching-strategies',
    title: 'Mastering fetch Caching',
    category: 'nextjs',
    difficulty: 'intermediate',
    description: 'revalidate, tags, and on-demand revalidation — when each one wins.',
    tags: ['caching', 'fetch', 'app-router'],
    estimatedMinutes: 30,
    readme: fetchCachingStrategiesReadme as unknown as string,
    loaders: {
      boilerplate: () => import('@/challenges/nextjs/intermediate/fetch-caching-strategies/boilerplate'),
      solution: () => import('@/challenges/nextjs/intermediate/fetch-caching-strategies/solution'),
    },
  },
  {
    slug: 'trie-autocomplete',
    title: 'Trie for Autocomplete',
    category: 'dsa',
    difficulty: 'intermediate',
    description: 'O(prefix length) lookup for type-ahead search — beats hashmap for prefix queries.',
    tags: ['trie', 'trees', 'search'],
    estimatedMinutes: 45,
    readme: trieAutocompleteReadme as unknown as string,
    loaders: {
      boilerplate: () => import('@/challenges/dsa/intermediate/trie-autocomplete/boilerplate'),
      solution: () => import('@/challenges/dsa/intermediate/trie-autocomplete/solution'),
    },
  },
  {
    slug: 'tree-diff',
    title: 'Diff Two Trees',
    category: 'dsa',
    difficulty: 'advanced',
    description: 'Structural diffing with keyed children — the simplified React reconciliation problem.',
    tags: ['trees', 'diff', 'reconciliation'],
    estimatedMinutes: 60,
    readme: treeDiffReadme as unknown as string,
    loaders: {
      boilerplate: () => import('@/challenges/dsa/advanced/tree-diff/boilerplate'),
      solution: () => import('@/challenges/dsa/advanced/tree-diff/solution'),
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
