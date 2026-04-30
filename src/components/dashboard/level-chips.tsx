'use client';

import { cn } from '@/lib/utils';
import type { ChallengeDifficulty } from '@/lib/types';

const LEVELS: ReadonlyArray<{ value: ChallengeDifficulty; label: string }> = [
  { value: 'basic', label: 'Basic' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

interface LevelChipsProps {
  selected: ReadonlySet<ChallengeDifficulty>;
  onToggle: (level: ChallengeDifficulty) => void;
}

export function LevelChips({ selected, onToggle }: LevelChipsProps): React.JSX.Element {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Level
      </span>
      {LEVELS.map((l) => {
        const active = selected.has(l.value);
        return (
          <button
            key={l.value}
            type="button"
            onClick={() => onToggle(l.value)}
            aria-pressed={active}
            className={cn(
              'inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition-colors',
              active
                ? 'border-transparent bg-primary text-primary-foreground'
                : 'border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
}
