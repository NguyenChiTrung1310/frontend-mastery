'use client';

import { useMemo } from 'react';
import { Search as SearchIcon } from 'lucide-react';

import type { ChallengeListItem } from '@/lib/challenge-list-item';
import { filterChallenges, indexChallenges } from '@/lib/challenge-search';
import { useFilterParams } from '@/hooks/use-filter-params';
import { Button } from '@/components/ui/button';
import { TechTabs } from './tech-tabs';
import { LevelChips } from './level-chips';
import { SearchBar } from './search-bar';
import { ResultsHeader } from './results-header';
import { ChallengeList } from './challenge-list';
import { EmptyState } from './empty-state';
import { useCommandPalette } from '@/components/command/command-palette-provider';

interface DashboardClientProps {
  items: readonly ChallengeListItem[];
}

export function DashboardClient({ items }: DashboardClientProps): React.JSX.Element {
  const { criteria, setTech, toggleLevel, setQuery, clearAll, hasActiveFilters } =
    useFilterParams();
  const { open: openPalette } = useCommandPalette();

  const indexed = useMemo(() => indexChallenges(items), [items]);
  const results = useMemo(() => filterChallenges(indexed, criteria), [indexed, criteria]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <TechTabs value={criteria.tech} onChange={setTech} />
        <Button
          variant="outline"
          size="sm"
          className="ml-auto gap-2"
          onClick={openPalette}
          type="button"
        >
          <SearchIcon className="h-4 w-4" />
          <span>Quick search</span>
          <kbd className="ml-1 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
            ⌘K
          </kbd>
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
        <SearchBar value={criteria.query} onChange={setQuery} />
        <LevelChips selected={criteria.levels} onToggle={toggleLevel} />
      </div>

      <ResultsHeader
        count={results.length}
        total={items.length}
        hasFilters={hasActiveFilters}
        onClear={clearAll}
      />

      {results.length === 0 ? (
        <EmptyState onClear={clearAll} />
      ) : (
        <ChallengeList items={results} />
      )}
    </div>
  );
}
