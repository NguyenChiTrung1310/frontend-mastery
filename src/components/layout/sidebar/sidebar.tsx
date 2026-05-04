import Link from 'next/link';
import { Atom } from 'lucide-react';

import { Separator } from '@/components/ui/separator';
import { CHALLENGES } from '@/registry/challenges';
import type { ChallengeListItem } from '@/lib/challenge-list-item';
import { SidebarBody } from './sidebar-body';
import Image from 'next/image';

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

export function Sidebar(): React.JSX.Element {
  const items = toListItems();

  return (
    <aside className="flex h-screen fixed z-50 w-72 shrink-0 flex-col border-r bg-card">
      <div className="px-6 py-5">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Image alt='Frontend Mastery' src="/assets/frontend-mastery.png" width={32} height={32} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-none">Frontend Mastery</span>
            <span className="text-xs text-muted-foreground">Local-first learning</span>
          </div>
        </Link>
      </div>
      <Separator />
      <SidebarBody items={items} />
    </aside>
  );
}
