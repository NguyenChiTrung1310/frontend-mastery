'use client';

import { SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onClear: () => void;
}

export function EmptyState({ onClear }: EmptyStateProps): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
      <SearchX className="mb-3 h-8 w-8 text-muted-foreground" />
      <p className="mb-1 text-sm font-medium">No challenges match your filters.</p>
      <p className="mb-4 text-sm text-muted-foreground">
        Try a different stack, drop a level, or clear everything.
      </p>
      <Button size="sm" variant="outline" onClick={onClear}>
        Reset filters
      </Button>
    </div>
  );
}
