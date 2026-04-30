'use client';

import { useCallback, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { ChallengeDifficulty } from '@/lib/types';
import type { FilterCriteria, SortKey, TechFilter } from '@/lib/challenge-search';

const TECH_VALUES: readonly TechFilter[] = [
  'all',
  'javascript',
  'typescript',
  'react',
  'nextjs',
  'dsa',
];

const LEVEL_VALUES: readonly ChallengeDifficulty[] = ['basic', 'intermediate', 'advanced'];

const SORT_VALUES: readonly SortKey[] = ['recommended', 'shortest', 'longest', 'title'];

function parseTech(raw: string | null): TechFilter {
  if (raw && (TECH_VALUES as readonly string[]).includes(raw)) return raw as TechFilter;
  return 'all';
}

function parseLevels(raw: string | null): Set<ChallengeDifficulty> {
  if (!raw) return new Set();
  const parts = raw.split(',').filter((p): p is ChallengeDifficulty =>
    (LEVEL_VALUES as readonly string[]).includes(p),
  );
  return new Set(parts);
}

function parseSort(raw: string | null): SortKey {
  if (raw && (SORT_VALUES as readonly string[]).includes(raw)) return raw as SortKey;
  return 'recommended';
}

export interface UseFilterParamsApi {
  criteria: FilterCriteria;
  setTech: (tech: TechFilter) => void;
  toggleLevel: (level: ChallengeDifficulty) => void;
  setQuery: (q: string) => void;
  setSort: (sort: SortKey) => void;
  clearAll: () => void;
  hasActiveFilters: boolean;
}

export function useFilterParams(): UseFilterParamsApi {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const criteria = useMemo<FilterCriteria>(
    () => ({
      tech: parseTech(params.get('tech')),
      levels: parseLevels(params.get('level')),
      query: params.get('q') ?? '',
      sort: parseSort(params.get('sort')),
    }),
    [params],
  );

  const writeParams = useCallback(
    (mutate: (p: URLSearchParams) => void): void => {
      const next = new URLSearchParams(params.toString());
      mutate(next);
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  const setTech = useCallback(
    (tech: TechFilter) => {
      writeParams((p) => {
        if (tech === 'all') p.delete('tech');
        else p.set('tech', tech);
      });
    },
    [writeParams],
  );

  const toggleLevel = useCallback(
    (level: ChallengeDifficulty) => {
      writeParams((p) => {
        const current = parseLevels(p.get('level'));
        if (current.has(level)) current.delete(level);
        else current.add(level);
        const ordered = LEVEL_VALUES.filter((l) => current.has(l)).join(',');
        if (ordered.length === 0) p.delete('level');
        else p.set('level', ordered);
      });
    },
    [writeParams],
  );

  const setQuery = useCallback(
    (q: string) => {
      writeParams((p) => {
        const trimmed = q.trim();
        if (trimmed.length === 0) p.delete('q');
        else p.set('q', trimmed);
      });
    },
    [writeParams],
  );

  const setSort = useCallback(
    (sort: SortKey) => {
      writeParams((p) => {
        if (sort === 'recommended') p.delete('sort');
        else p.set('sort', sort);
      });
    },
    [writeParams],
  );

  const clearAll = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  const hasActiveFilters =
    criteria.tech !== 'all' ||
    criteria.levels.size > 0 ||
    criteria.query.length > 0 ||
    criteria.sort !== 'recommended';

  return { criteria, setTech, toggleLevel, setQuery, setSort, clearAll, hasActiveFilters };
}
