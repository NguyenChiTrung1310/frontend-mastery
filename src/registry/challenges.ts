import type { ChallengeEntry, ChallengePath } from '@/lib/types';

// Markdown READMEs imported as raw strings via the webpack rule in next.config.mjs.
import treeDiffReadme from '@/challenges/dsa/advanced/tree-diff/README.md';
import validParenthesesReadme from '@/challenges/dsa/basic/valid-parentheses/README.md';
import lruCacheReadme from '@/challenges/dsa/intermediate/lru-cache/README.md';
import trieAutocompleteReadme from '@/challenges/dsa/intermediate/trie-autocomplete/README.md';
import cancellablePromisesReadme from '@/challenges/javascript/advanced/cancellable-promises/README.md';
import arrayMethodReimplementationReadme from '@/challenges/javascript/basic/array-method-reimplementation/README.md';
import debounceThrottleReadme from '@/challenges/javascript/basic/debounce-throttle/README.md';
import deepCloneReadme from '@/challenges/javascript/basic/deep-clone/README.md';
import eventLoopTraceReadme from '@/challenges/javascript/basic/event-loop-trace/README.md';
import thisBindingQuizReadme from '@/challenges/javascript/basic/this-binding-quiz/README.md';
import asyncIteratorReadme from '@/challenges/javascript/intermediate/async-iterator/README.md';
import bindCallApplyReadme from '@/challenges/javascript/intermediate/bind-call-apply/README.md';
import customPromiseAllReadme from '@/challenges/javascript/intermediate/custom-promise-all/README.md';
import modulePatternIifeReadme from '@/challenges/javascript/intermediate/module-pattern-iife/README.md';
import promisePoolReadme from '@/challenges/javascript/intermediate/promise-pool/README.md';
import streamingSuspenseReadme from '@/challenges/nextjs/advanced/streaming-suspense/README.md';
import fetchCachingStrategiesReadme from '@/challenges/nextjs/intermediate/fetch-caching-strategies/README.md';
import serverActionsFormReadme from '@/challenges/nextjs/intermediate/server-actions-form/README.md';
import renderOptimizationReadme from '@/challenges/react/advanced/render-optimization/README.md';
import tokenRefreshInterceptorReadme from '@/challenges/react/advanced/token-refresh-interceptor/README.md';
import useSyncExternalStoreReadme from '@/challenges/react/advanced/use-sync-external-store/README.md';
import virtualizedListFromScratchReadme from '@/challenges/react/advanced/virtualized-list-from-scratch/README.md';
import useFetchRaceConditionReadme from '@/challenges/react/intermediate/use-fetch-race-condition/README.md';
import useEffectCleanupReadme from '@/challenges/react/intermediate/use-effect-cleanup/README.md';
import staleClosureUseEffectReadme from '@/challenges/react/intermediate/stale-closure-useeffect/README.md';
import optimisticUiRollbackReadme from '@/challenges/react/intermediate/optimistic-ui-rollback/README.md';
import capturedPropsVsRefsReadme from '@/challenges/react/intermediate/captured-props-vs-refs/README.md';
import contextPerformanceProblemReadme from '@/challenges/react/intermediate/context-performance-problem/README.md';
import useReducerComplexStateReadme from '@/challenges/react/intermediate/use-reducer-complex-state/README.md';
import useLocalStorageSsrSafeReadme from '@/challenges/react/intermediate/use-local-storage-ssr-safe/README.md';
import usecallbackReferentialStabilityReadme from '@/challenges/react/intermediate/usecallback-referential-stability/README.md';
import discriminatedUnionsReadme from '@/challenges/typescript/basic/discriminated-unions/README.md';
import genericUtilityTypesReadme from '@/challenges/typescript/intermediate/generic-utility-types/README.md';
import typedEventEmitterReadme from '@/challenges/typescript/intermediate/typed-event-emitter/README.md';

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
    slug: 'optimistic-ui-rollback',
    title: 'Optimistic UI with Rollback',
    category: 'react',
    difficulty: 'intermediate',
    description: 'Update state instantly on user action, then roll back cleanly if the server fails.',
    tags: ['optimistic-ui', 'async', 'ux', 'error-handling', 'useState'],
    estimatedMinutes: 35,
    readme: optimisticUiRollbackReadme as unknown as string,
    loaders: {
      boilerplate: () => import('@/challenges/react/intermediate/optimistic-ui-rollback/boilerplate'),
      solution: () => import('@/challenges/react/intermediate/optimistic-ui-rollback/solution'),
    },
  },
  {
    slug: 'use-local-storage-ssr-safe',
    title: 'SSR-Safe useLocalStorage Hook',
    category: 'react',
    difficulty: 'intermediate',
    description:
      'Build a localStorage hook that survives server-side rendering and hydration mismatch.',
    tags: ['hooks', 'localStorage', 'ssr', 'hydration', 'custom-hooks'],
    estimatedMinutes: 30,
    readme: useLocalStorageSsrSafeReadme as unknown as string,
    loaders: {
      boilerplate: () =>
        import('@/challenges/react/intermediate/use-local-storage-ssr-safe/boilerplate'),
      solution: () =>
        import('@/challenges/react/intermediate/use-local-storage-ssr-safe/solution'),
    },
  },
  {
    slug: 'use-reducer-complex-state',
    title: 'useReducer for Complex State',
    category: 'react',
    difficulty: 'intermediate',
    description:
      'Refactor tangled multi-useState into a single useReducer — predictable state transitions.',
    tags: ['useReducer', 'state-management', 'complex-state', 'dispatch'],
    estimatedMinutes: 35,
    readme: useReducerComplexStateReadme as unknown as string,
    loaders: {
      boilerplate: () =>
        import('@/challenges/react/intermediate/use-reducer-complex-state/boilerplate'),
      solution: () =>
        import('@/challenges/react/intermediate/use-reducer-complex-state/solution'),
    },
  },
  {
    slug: 'context-performance-problem',
    title: 'Context Re-render Performance Problem',
    category: 'react',
    difficulty: 'intermediate',
    description:
      'See how a single context value change re-renders every consumer — and how to fix it.',
    tags: ['context', 'performance', 're-renders', 'useMemo', 'split-context'],
    estimatedMinutes: 35,
    readme: contextPerformanceProblemReadme as unknown as string,
    loaders: {
      boilerplate: () =>
        import('@/challenges/react/intermediate/context-performance-problem/boilerplate'),
      solution: () =>
        import('@/challenges/react/intermediate/context-performance-problem/solution'),
    },
  },
  {
    slug: 'captured-props-vs-refs',
    title: 'Captured Props vs Refs — Closures in Event Handlers',
    category: 'react',
    difficulty: 'intermediate',
    description: 'Understand why event handlers capture stale props and how useRef solves it.',
    tags: ['closures', 'useRef', 'event-handlers', 'props', 'stale-values'],
    estimatedMinutes: 30,
    readme: capturedPropsVsRefsReadme as unknown as string,
    loaders: {
      boilerplate: () =>
        import('@/challenges/react/intermediate/captured-props-vs-refs/boilerplate'),
      solution: () => import('@/challenges/react/intermediate/captured-props-vs-refs/solution'),
    },
  },
  {
    slug: 'stale-closure-useeffect',
    title: 'Stale Closure in useEffect',
    category: 'react',
    difficulty: 'intermediate',
    description: 'Diagnose and fix stale state values captured inside useEffect callbacks.',
    tags: ['hooks', 'closures', 'useRef', 'useEffect', 'deps'],
    estimatedMinutes: 30,
    readme: staleClosureUseEffectReadme as unknown as string,
    loaders: {
      boilerplate: () => import('@/challenges/react/intermediate/stale-closure-useeffect/boilerplate'),
      solution: () => import('@/challenges/react/intermediate/stale-closure-useeffect/solution'),
    },
  },
  {
    slug: 'use-effect-cleanup',
    title: 'useEffect Cleanup & Memory Leaks',
    category: 'react',
    difficulty: 'intermediate',
    description: 'Fix a component that leaks timers and event listeners on unmount.',
    tags: ['hooks', 'useEffect', 'memory-leak', 'cleanup'],
    estimatedMinutes: 30,
    readme: useEffectCleanupReadme as unknown as string,
    loaders: {
      boilerplate: () => import('@/challenges/react/intermediate/use-effect-cleanup/boilerplate'),
      solution: () => import('@/challenges/react/intermediate/use-effect-cleanup/solution'),
    },
  },
  {
    slug: 'usecallback-referential-stability',
    title: 'useCallback & Referential Stability',
    category: 'react',
    difficulty: 'intermediate',
    description: 'Understand why inline functions silently break React.memo and when useCallback helps.',
    tags: ['useCallback', 'React.memo', 'referential-equality', 'performance'],
    estimatedMinutes: 35,
    readme: usecallbackReferentialStabilityReadme as unknown as string,
    loaders: {
      boilerplate: () =>
        import('@/challenges/react/intermediate/usecallback-referential-stability/boilerplate'),
      solution: () =>
        import('@/challenges/react/intermediate/usecallback-referential-stability/solution'),
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
    slug: 'token-refresh-interceptor',
    title: 'Token Refresh Interceptor — Silent Re-authentication',
    category: 'react',
    difficulty: 'advanced',
    description:
      'Implement a single-refresh queue so 5 parallel 401s trigger only one token refresh.',
    tags: ['auth', 'axios', 'interceptor', 'queue', 'token-refresh', 'async'],
    estimatedMinutes: 50,
    readme: tokenRefreshInterceptorReadme as unknown as string,
    loaders: {
      boilerplate: () =>
        import('@/challenges/react/advanced/token-refresh-interceptor/boilerplate'),
      solution: () =>
        import('@/challenges/react/advanced/token-refresh-interceptor/solution'),
    },
  },
  {
    slug: 'virtualized-list-from-scratch',
    title: 'Virtualized List from Scratch',
    category: 'react',
    difficulty: 'advanced',
    description: 'Build a windowed list that renders only visible rows — no library, pure math.',
    tags: ['virtualization', 'performance', 'scroll', 'dom', 'windowing'],
    estimatedMinutes: 55,
    readme: virtualizedListFromScratchReadme as unknown as string,
    loaders: {
      boilerplate: () =>
        import('@/challenges/react/advanced/virtualized-list-from-scratch/boilerplate'),
      solution: () =>
        import('@/challenges/react/advanced/virtualized-list-from-scratch/solution'),
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
    slug: 'valid-parentheses',
    title: 'Valid Parentheses',
    category: 'dsa',
    difficulty: 'basic',
    description: 'Use a stack to validate bracket pairs — LeetCode 20, the gateway to stack problems.',
    tags: ['stack', 'string', 'brackets', 'leetcode'],
    estimatedMinutes: 20,
    readme: validParenthesesReadme as unknown as string,
    loaders: {
      boilerplate: () => import('@/challenges/dsa/basic/valid-parentheses/boilerplate'),
      solution: () => import('@/challenges/dsa/basic/valid-parentheses/solution'),
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
  {
    slug: 'this-binding-quiz',
    title: 'This Binding Quiz',
    category: 'javascript',
    difficulty: 'basic',
    description: 'Three snippets with broken this — fix each using .bind(), arrow functions, or explicit context.',
    tags: ['this', 'closures', 'oop'],
    estimatedMinutes: 20,
    readme: thisBindingQuizReadme as unknown as string,
    loaders: {
      boilerplate: () => import('@/challenges/javascript/basic/this-binding-quiz/boilerplate'),
      solution: () => import('@/challenges/javascript/basic/this-binding-quiz/solution'),
    },
  },
  {
    slug: 'array-method-reimplementation',
    title: 'Reimplement Array Methods',
    category: 'javascript',
    difficulty: 'basic',
    description: 'Build myMap, myFilter, myReduce, and myFlatMap from scratch using only for loops.',
    tags: ['arrays', 'higher-order-functions', 'iteration'],
    estimatedMinutes: 25,
    readme: arrayMethodReimplementationReadme as unknown as string,
    loaders: {
      boilerplate: () => import('@/challenges/javascript/basic/array-method-reimplementation/boilerplate'),
      solution: () => import('@/challenges/javascript/basic/array-method-reimplementation/solution'),
    },
  },
  {
    slug: 'deep-clone',
    title: 'Deep Clone',
    category: 'javascript',
    difficulty: 'basic',
    description: 'Implement deepClone handling nested objects, arrays, Dates, and circular references.',
    tags: ['objects', 'recursion', 'cloning'],
    estimatedMinutes: 30,
    readme: deepCloneReadme as unknown as string,
    loaders: {
      boilerplate: () => import('@/challenges/javascript/basic/deep-clone/boilerplate'),
      solution: () => import('@/challenges/javascript/basic/deep-clone/solution'),
    },
  },
  {
    slug: 'event-loop-trace',
    title: 'Event Loop Trace',
    category: 'javascript',
    difficulty: 'basic',
    description: 'Predict console output order across synchronous code, Promises (microtasks), and setTimeout (macrotasks).',
    tags: ['event-loop', 'promises', 'async'],
    estimatedMinutes: 20,
    readme: eventLoopTraceReadme as unknown as string,
    loaders: {
      boilerplate: () => import('@/challenges/javascript/basic/event-loop-trace/boilerplate'),
      solution: () => import('@/challenges/javascript/basic/event-loop-trace/solution'),
    },
  },
  {
    slug: 'custom-promise-all',
    title: 'Implement Promise.all',
    category: 'javascript',
    difficulty: 'intermediate',
    description: 'Re-implement Promise.all from scratch — resolve in order, reject fast, handle empty arrays.',
    tags: ['promises', 'async', 'concurrency'],
    estimatedMinutes: 30,
    readme: customPromiseAllReadme as unknown as string,
    loaders: {
      boilerplate: () => import('@/challenges/javascript/intermediate/custom-promise-all/boilerplate'),
      solution: () => import('@/challenges/javascript/intermediate/custom-promise-all/solution'),
    },
  },
  {
    slug: 'module-pattern-iife',
    title: 'Module Pattern & IIFE',
    category: 'javascript',
    difficulty: 'intermediate',
    description: 'Implement truly private state using the Revealing Module Pattern (IIFE + closure).',
    tags: ['closures', 'iife', 'encapsulation'],
    estimatedMinutes: 25,
    readme: modulePatternIifeReadme as unknown as string,
    loaders: {
      boilerplate: () => import('@/challenges/javascript/intermediate/module-pattern-iife/boilerplate'),
      solution: () => import('@/challenges/javascript/intermediate/module-pattern-iife/solution'),
    },
  },
  {
    slug: 'bind-call-apply',
    title: 'Implement bind, call, apply',
    category: 'javascript',
    difficulty: 'intermediate',
    description: 'Re-implement Function.prototype.bind/call/apply using only basic language primitives.',
    tags: ['this', 'prototypes', 'functions'],
    estimatedMinutes: 35,
    readme: bindCallApplyReadme as unknown as string,
    loaders: {
      boilerplate: () => import('@/challenges/javascript/intermediate/bind-call-apply/boilerplate'),
      solution: () => import('@/challenges/javascript/intermediate/bind-call-apply/solution'),
    },
  },
  {
    slug: 'async-iterator',
    title: 'Async Iterators & for-await-of',
    category: 'javascript',
    difficulty: 'intermediate',
    description: 'Build a paginating async generator and consume it with for-await-of for true streaming.',
    tags: ['async', 'generators', 'iterators'],
    estimatedMinutes: 35,
    readme: asyncIteratorReadme as unknown as string,
    loaders: {
      boilerplate: () => import('@/challenges/javascript/intermediate/async-iterator/boilerplate'),
      solution: () => import('@/challenges/javascript/intermediate/async-iterator/solution'),
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
