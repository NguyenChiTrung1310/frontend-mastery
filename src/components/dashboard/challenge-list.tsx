'use client';

import dynamic from 'next/dynamic';

import type { ChallengeListItem } from '@/lib/challenge-list-item';
import { ChallengeCard } from './challenge-card';

export const VIRTUALIZE_THRESHOLD = 50;

const VirtualizedChallengeList = dynamic(
  () => import('./virtualized-challenge-list').then((m) => m.VirtualizedChallengeList),
  { ssr: false },
);

interface ChallengeListProps {
  items: readonly ChallengeListItem[];
}

export function ChallengeList({ items }: ChallengeListProps): React.JSX.Element {
  if (items.length > VIRTUALIZE_THRESHOLD) {
    return <VirtualizedChallengeList items={items} />;
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <ChallengeCard key={item.slug} item={item} />
      ))}
    </div>
  );
}
