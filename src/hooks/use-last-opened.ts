'use client';

import { useCallback } from 'react';
import { usePersistedState } from '@/hooks/use-persisted-state';
import type { ChallengeCategory, ChallengeDifficulty } from '@/lib/types';

export interface LastOpenedRecord {
  slug: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  title: string;
  estimatedMinutes?: number;
  openedAt: number;
}

const KEY = 'fm:last-opened';

function isRecord(raw: unknown): raw is LastOpenedRecord {
  if (typeof raw !== 'object' || raw === null) return false;
  const r = raw as Partial<LastOpenedRecord>;
  return (
    typeof r.slug === 'string' &&
    typeof r.category === 'string' &&
    typeof r.difficulty === 'string' &&
    typeof r.title === 'string' &&
    typeof r.openedAt === 'number'
  );
}

export interface UseLastOpenedApi {
  record: LastOpenedRecord | null;
  setRecord: (next: Omit<LastOpenedRecord, 'openedAt'>) => void;
  clear: () => void;
}

export function useLastOpened(): UseLastOpenedApi {
  const [state, setState] = usePersistedState<LastOpenedRecord | null>(KEY, null, {
    validate: (raw): raw is LastOpenedRecord | null => raw === null || isRecord(raw),
  });

  const setRecord = useCallback(
    (next: Omit<LastOpenedRecord, 'openedAt'>): void => {
      setState({ ...next, openedAt: Date.now() });
    },
    [setState],
  );

  const clear = useCallback(() => setState(null), [setState]);

  return { record: state, setRecord, clear };
}
