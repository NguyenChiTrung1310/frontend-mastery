'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { Star, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useBookmarks } from '@/hooks/use-bookmarks';
import { getChallengeHref, type ChallengeListItem } from '@/lib/challenge-list-item';

interface BookmarksListProps {
  items: readonly ChallengeListItem[];
}

export function BookmarksList({ items }: BookmarksListProps): React.JSX.Element {
  const { slugs, remove } = useBookmarks();
  const pathname = usePathname();

  const bookmarked = useMemo(
    () => items.filter((i) => slugs.has(i.slug)),
    [items, slugs],
  );

  return (
    <section aria-labelledby="sidebar-bookmarks">
      <div className="mb-2 flex items-center gap-2 px-1">
        <h2
          id="sidebar-bookmarks"
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          Bookmarks
        </h2>
        <span className="ml-auto text-xs text-muted-foreground">{bookmarked.length}</span>
      </div>
      {bookmarked.length === 0 ? (
        <div className="flex items-start gap-2 rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
          <Star className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>Star a challenge from the dashboard to pin it here.</span>
        </div>
      ) : (
        <ul className="space-y-1">
          {bookmarked.map((item) => {
            const href = getChallengeHref(item);
            const active = pathname === href;
            return (
              <li key={item.slug} className="group/row relative">
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 pr-9 text-sm transition-colors',
                    active
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                  )}
                >
                  <Star className="h-3.5 w-3.5 shrink-0 fill-current" />
                  <span className="line-clamp-1">{item.title}</span>
                </Link>
                <button
                  type="button"
                  aria-label={`Remove ${item.title} bookmark`}
                  onClick={() => remove(item.slug)}
                  className="absolute right-1.5 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-background hover:text-foreground focus-visible:opacity-100 group-hover/row:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
