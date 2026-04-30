'use client';

import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

import type { ChallengeListItem } from '@/lib/challenge-list-item';
import { ChallengeCard } from './challenge-card';

const ROW_HEIGHT = 220;
const GAP = 16;
const CONTAINER_HEIGHT = 'calc(100vh - 320px)';

interface VirtualizedChallengeListProps {
  items: readonly ChallengeListItem[];
}

export function VirtualizedChallengeList({
  items,
}: VirtualizedChallengeListProps): React.JSX.Element {
  const parentRef = useRef<HTMLDivElement | null>(null);

  // Two cards per row on md+, one on small screens. We pair items so each virtual row
  // renders 1 or 2 cards. estimateSize covers both cases since cards are roughly equal.
  const rows = useRef<ChallengeListItem[][]>([]);
  rows.current = pairItems(items);

  const virtualizer = useVirtualizer({
    count: rows.current.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT + GAP,
    overscan: 6,
  });

  return (
    <div
      ref={parentRef}
      className="overflow-y-auto rounded-md"
      style={{ height: CONTAINER_HEIGHT }}
    >
      <div
        className="relative w-full"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualizer.getVirtualItems().map((vRow) => {
          const pair = rows.current[vRow.index];
          if (!pair) return null;
          return (
            <div
              key={vRow.key}
              data-index={vRow.index}
              className="absolute left-0 top-0 grid w-full gap-4 pr-2 md:grid-cols-2"
              style={{ transform: `translateY(${vRow.start}px)`, height: `${ROW_HEIGHT}px` }}
            >
              {pair.map((item) => (
                <ChallengeCard key={item.slug} item={item} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function pairItems<T>(items: readonly T[]): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    const first = items[i];
    const second = items[i + 1];
    if (first === undefined) continue;
    out.push(second === undefined ? [first] : [first, second]);
  }
  return out;
}
