import type { ChallengeCategory, ChallengeDifficulty } from '@/lib/types';
import type { ChallengeListItem } from '@/lib/challenge-list-item';

export type TechFilter = 'all' | ChallengeCategory;
export type SortKey = 'recommended' | 'shortest' | 'longest' | 'title';

export interface FilterCriteria {
  tech: TechFilter;
  levels: ReadonlySet<ChallengeDifficulty>;
  query: string;
  sort: SortKey;
}

interface IndexedItem {
  item: ChallengeListItem;
  haystack: string;
}

export function indexChallenges(items: readonly ChallengeListItem[]): IndexedItem[] {
  return items.map((item) => ({
    item,
    haystack: [
      item.title,
      item.description,
      item.category,
      item.difficulty,
      ...(item.tags ?? []),
    ]
      .join(' ')
      .toLowerCase(),
  }));
}

function matches(haystack: string, query: string): boolean {
  if (!query) return true;
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  return tokens.every((t) => haystack.includes(t));
}

const DIFFICULTY_RANK: Record<ChallengeDifficulty, number> = {
  basic: 0,
  intermediate: 1,
  advanced: 2,
};

const CATEGORY_RANK: Record<ChallengeCategory, number> = {
  javascript: 0,
  typescript: 1,
  react: 2,
  nextjs: 3,
  dsa: 4,
};

function compareRecommended(a: ChallengeListItem, b: ChallengeListItem): number {
  const cat = CATEGORY_RANK[a.category] - CATEGORY_RANK[b.category];
  if (cat !== 0) return cat;
  const diff = DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty];
  if (diff !== 0) return diff;
  return a.title.localeCompare(b.title);
}

export function filterChallenges(
  indexed: readonly IndexedItem[],
  criteria: FilterCriteria,
): ChallengeListItem[] {
  const { tech, levels, query, sort } = criteria;
  const trimmed = query.trim();

  const filtered: ChallengeListItem[] = [];
  for (const entry of indexed) {
    const { item, haystack } = entry;
    if (tech !== 'all' && item.category !== tech) continue;
    if (levels.size > 0 && !levels.has(item.difficulty)) continue;
    if (!matches(haystack, trimmed)) continue;
    filtered.push(item);
  }

  switch (sort) {
    case 'shortest':
      return filtered.sort((a, b) => (a.estimatedMinutes ?? 0) - (b.estimatedMinutes ?? 0));
    case 'longest':
      return filtered.sort((a, b) => (b.estimatedMinutes ?? 0) - (a.estimatedMinutes ?? 0));
    case 'title':
      return filtered.sort((a, b) => a.title.localeCompare(b.title));
    case 'recommended':
    default:
      return filtered.sort(compareRecommended);
  }
}
