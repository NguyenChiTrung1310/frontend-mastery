import { Suspense } from 'react';
import { Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { CHALLENGES } from '@/registry/challenges';
import type { ChallengeListItem } from '@/lib/challenge-list-item';
import { DashboardClient } from './dashboard-client';

function toListItems(): ChallengeListItem[] {
  return CHALLENGES.map(
    ({ slug, title, category, difficulty, description, tags, estimatedMinutes }) => ({
      slug,
      title,
      category,
      difficulty,
      description,
      tags,
      estimatedMinutes,
    }),
  );
}

export function DashboardShell(): React.JSX.Element {
  const items = toListItems();

  return (
    <div className="min-h-screen">
      <section className="mx-auto max-w-6xl px-8 py-12">
        <div className="mb-10">
          <Badge className="mb-4">
            <Sparkles className="mr-1 h-3 w-3" />
            Local-first
          </Badge>
          <h1 className="mb-3 text-4xl font-bold tracking-tight">Frontend Mastery</h1>
          <p className="text-lg text-muted-foreground">
            Pick a challenge. Filter by stack and level, or jump straight to one with{' '}
            <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs font-mono">⌘K</kbd>.
            <br />
            Filters live in the URL — share away.
          </p>
        </div>

        <Suspense fallback={<DashboardFallback />}>
          <DashboardClient items={items} />
        </Suspense>
      </section>
    </div>
  );
}

function DashboardFallback(): React.JSX.Element {
  return (
    <div className="space-y-4">
      <div className="h-9 w-full max-w-md animate-pulse rounded-md bg-muted" />
      <div className="h-9 w-3/4 animate-pulse rounded-md bg-muted" />
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
