'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResultsHeaderProps {
  count: number;
  total: number;
  hasFilters: boolean;
  onClear: () => void;
}

export function ResultsHeader({
  count,
  total,
  hasFilters,
  onClear,
}: ResultsHeaderProps): React.JSX.Element {
  return (
    <div className="flex items-center justify-between border-b pb-2 text-sm text-muted-foreground">
      <span>
        {count === total ? (
          <>
            <span className="font-medium text-foreground">{total}</span> challenges
          </>
        ) : (
          <>
            <span className="font-medium text-foreground">{count}</span> of {total} challenges
          </>
        )}
      </span>
      {hasFilters ? (
        <Button variant="ghost" size="sm" onClick={onClear} className="h-7 gap-1 text-xs">
          <X className="h-3 w-3" />
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}
