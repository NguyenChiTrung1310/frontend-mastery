'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { ChallengeListItem } from '@/lib/challenge-list-item';
import { ContinueLearning } from './continue-learning';
import { BookmarksList } from './bookmarks-list';
import { ThemeToggle } from './theme-toggle';

interface SidebarBodyProps {
  items: readonly ChallengeListItem[];
}

export function SidebarBody({ items }: SidebarBodyProps): React.JSX.Element {
  return (
    <>
      <ScrollArea className="flex-1">
        <div className="space-y-6 px-4 py-5">
          <ContinueLearning />
          <BookmarksList items={items} />
        </div>
      </ScrollArea>
      <Separator />
      <div className="flex items-center justify-between px-6 py-3 text-xs text-muted-foreground">
        <span>
          Edit <code className="rounded bg-muted px-1 py-0.5">boilerplate.tsx</code>
        </span>
        <ThemeToggle />
      </div>
    </>
  );
}
