'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { Code2, Boxes, Atom, Zap, Brain } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { ChallengeCategory, ChallengeMeta } from '@/lib/types';

type SidebarItem = Pick<ChallengeMeta, 'slug' | 'title' | 'category' | 'difficulty'>;
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const CATEGORY_META: Record<
  ChallengeCategory,
  { label: string; icon: LucideIcon; accent: string }
> = {
  javascript: { label: 'JavaScript', icon: Code2, accent: 'text-yellow-500' },
  typescript: { label: 'TypeScript', icon: Boxes, accent: 'text-blue-500' },
  react: { label: 'React', icon: Atom, accent: 'text-cyan-500' },
  nextjs: { label: 'Next.js', icon: Zap, accent: 'text-foreground' },
  dsa: { label: 'DSA', icon: Brain, accent: 'text-violet-500' },
};

const DIFFICULTY_VARIANT: Record<ChallengeMeta['difficulty'], 'secondary' | 'default' | 'destructive'> = {
  basic: 'secondary',
  intermediate: 'default',
  advanced: 'destructive',
};

interface SidebarProps {
  grouped: Readonly<Record<string, SidebarItem[]>>;
}

export function Sidebar({ grouped }: SidebarProps): React.JSX.Element {
  const pathname = usePathname();

  // Stable iteration order — categories follow the enum declaration order.
  const categories = useMemo<ChallengeCategory[]>(
    () => ['javascript', 'typescript', 'react', 'nextjs', 'dsa'],
    [],
  );

  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col border-r bg-card">
      <div className="px-6 py-5">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Atom className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-none">Frontend Mastery</span>
            <span className="text-xs text-muted-foreground">Local-first learning</span>
          </div>
        </Link>
      </div>
      <Separator />
      <ScrollArea className="flex-1 px-3 py-4">
        {categories.map((category) => {
          const items = grouped[category] ?? [];
          if (items.length === 0) return null;

          const meta = CATEGORY_META[category];
          const Icon = meta.icon;

          return (
            <section key={category} className="mb-6">
              <div className="mb-2 flex items-center gap-2 px-3">
                <Icon className={cn('h-4 w-4', meta.accent)} />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {meta.label}
                </h2>
                <span className="ml-auto text-xs text-muted-foreground">{items.length}</span>
              </div>
              <ul className="space-y-1">
                {items.map((c) => {
                  const href = `/challenges/${c.category}/${c.difficulty}/${c.slug}`;
                  const isActive = pathname === href;
                  return (
                    <li key={c.slug}>
                      <Link
                        href={href}
                        className={cn(
                          'group flex flex-col gap-1 rounded-md px-3 py-2 text-sm transition-colors',
                          isActive
                            ? 'bg-accent text-accent-foreground'
                            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                        )}
                      >
                        <span className="line-clamp-1 font-medium">{c.title}</span>
                        <Badge
                          variant={DIFFICULTY_VARIANT[c.difficulty]}
                          className="w-fit text-[10px] capitalize"
                        >
                          {c.difficulty}
                        </Badge>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </ScrollArea>
      <Separator />
      <div className="px-6 py-3 text-xs text-muted-foreground">
        Edit <code className="rounded bg-muted px-1 py-0.5">boilerplate.tsx</code> in your IDE — UI hot reloads.
      </div>
    </aside>
  );
}
