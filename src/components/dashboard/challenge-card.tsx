'use client';

import Link from 'next/link';
import { ArrowRight, Clock, Star } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getChallengeHref, type ChallengeListItem } from '@/lib/challenge-list-item';
import { useBookmarks } from '@/hooks/use-bookmarks';

interface ChallengeCardProps {
  item: ChallengeListItem;
}

export function ChallengeCard({ item }: ChallengeCardProps): React.JSX.Element {
  const { isBookmarked, toggle } = useBookmarks();
  const starred = isBookmarked(item.slug);
  const href = getChallengeHref(item);

  return (
    <Card className="group relative flex h-full flex-col transition-shadow hover:shadow-md">
      {/* <Button aria-pressed={starred} aria-label={starred ? 'Remove bookmark' : 'Bookmark challenge'} size='icon' variant='ghost' className="absolute right-4 top-[18px] w-8 h-8" onClick={() => toggle(item.slug)}>
        <Star className={cn('h-4 w-4', starred && 'fill-current')} />
      </Button> */}

      <CardHeader>
        <div className="mb-2 flex items-center gap-2">
          <Badge variant="outline" className="capitalize">
            {item.category}
          </Badge>
          <Badge
            variant={item.difficulty === 'advanced' ? 'destructive' : 'secondary'}
            className="capitalize"
          >
            {item.difficulty}
          </Badge>
          {typeof item.estimatedMinutes === 'number' ? (
            <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {item.estimatedMinutes}m
            </span>
          ) : null}
          <Button aria-pressed={starred} aria-label={starred ? 'Remove bookmark' : 'Bookmark challenge'} size='icon' variant='ghost' className="w-8 h-8" onClick={() => toggle(item.slug)}>
            <Star className={cn('h-4 w-4', starred && 'fill-current')} />
          </Button>
        </div>
        <CardTitle className="text-base">{item.title}</CardTitle>
        <CardDescription className="line-clamp-2">{item.description}</CardDescription>
      </CardHeader>

      <CardContent className="mt-auto flex items-center justify-between pt-0">
        <div className="flex flex-wrap gap-1">
          {item.tags?.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href={href}>
            Open
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
