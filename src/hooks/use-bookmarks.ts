'use client';

import { useCallback, useMemo } from 'react';
import { usePersistedState } from '@/hooks/use-persisted-state';

interface BookmarksState {
  slugs: string[];
}

const KEY = 'fm:bookmarks';
const INITIAL: BookmarksState = { slugs: [] };

function isBookmarksState(raw: unknown): raw is BookmarksState {
  return (
    typeof raw === 'object' &&
    raw !== null &&
    'slugs' in raw &&
    Array.isArray((raw as BookmarksState).slugs) &&
    (raw as BookmarksState).slugs.every((s) => typeof s === 'string')
  );
}

export interface UseBookmarksApi {
  slugs: ReadonlySet<string>;
  isBookmarked: (slug: string) => boolean;
  toggle: (slug: string) => void;
  remove: (slug: string) => void;
}

export function useBookmarks(): UseBookmarksApi {
  const [state, setState] = usePersistedState<BookmarksState>(KEY, INITIAL, {
    validate: isBookmarksState,
  });

  const slugs = useMemo(() => new Set(state.slugs), [state.slugs]);

  const toggle = useCallback(
    (slug: string): void => {
      setState((prev) => {
        const has = prev.slugs.includes(slug);
        return {
          slugs: has ? prev.slugs.filter((s) => s !== slug) : [...prev.slugs, slug],
        };
      });
    },
    [setState],
  );

  const remove = useCallback(
    (slug: string): void => {
      setState((prev) => ({ slugs: prev.slugs.filter((s) => s !== slug) }));
    },
    [setState],
  );

  const isBookmarked = useCallback((slug: string) => slugs.has(slug), [slugs]);

  return { slugs, isBookmarked, toggle, remove };
}
