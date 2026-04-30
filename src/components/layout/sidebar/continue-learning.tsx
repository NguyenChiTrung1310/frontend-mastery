'use client';

import Link from 'next/link';
import { ArrowUpRight, Clock } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { useLastOpened } from '@/hooks/use-last-opened';
import { getChallengeHref } from '@/lib/challenge-list-item';

export function ContinueLearning(): React.JSX.Element | null {
  const { record } = useLastOpened();

  if (!record) return null;

  return (
    <section aria-labelledby="sidebar-continue">
      <h2
        id="sidebar-continue"
        className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
      >
        Continue learning
      </h2>
      <Link
        href={getChallengeHref(record)}
        className="group flex flex-col gap-2 rounded-lg border bg-background p-3 transition-colors hover:bg-accent"
      >
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize text-[10px]">
            {record.category}
          </Badge>
          <Badge
            variant={record.difficulty === 'advanced' ? 'destructive' : 'secondary'}
            className="capitalize text-[10px]"
          >
            {record.difficulty}
          </Badge>
          <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>
        <span className="line-clamp-2 text-sm font-medium">{record.title}</span>
        {typeof record.estimatedMinutes === 'number' ? (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {record.estimatedMinutes} min
          </span>
        ) : null}
      </Link>
    </section>
  );
}
