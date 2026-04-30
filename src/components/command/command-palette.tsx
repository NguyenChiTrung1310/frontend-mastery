'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Atom, Boxes, Brain, Code2, Dice5, Moon, Sun, Zap, X as XIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import type { ChallengeCategory } from '@/lib/types';
import { getChallengeHref, type ChallengeListItem } from '@/lib/challenge-list-item';

const CATEGORY_ICON: Record<ChallengeCategory, LucideIcon> = {
  javascript: Code2,
  typescript: Boxes,
  react: Atom,
  nextjs: Zap,
  dsa: Brain,
};

interface CommandPaletteProps {
  items: readonly ChallengeListItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({
  items,
  open,
  onOpenChange,
}: CommandPaletteProps): React.JSX.Element {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  const closeAfter = useCallback(
    (fn: () => void) => {
      fn();
      onOpenChange(false);
    },
    [onOpenChange],
  );

  const navigateTo = useCallback(
    (path: string) => closeAfter(() => router.push(path)),
    [closeAfter, router],
  );

  const openRandom = useCallback(() => {
    if (items.length === 0) return;
    const idx = Math.floor(Math.random() * items.length);
    const pick = items[idx];
    if (!pick) return;
    navigateTo(getChallengeHref(pick));
  }, [items, navigateTo]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search challenges or run a command…" />
      <CommandList>
        <CommandEmpty>No matches.</CommandEmpty>

        <CommandGroup heading="Quick actions">
          <CommandItem
            value="toggle theme"
            onSelect={() => closeAfter(() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'))}
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span>Toggle theme</span>
          </CommandItem>
          <CommandItem value="random challenge" onSelect={openRandom}>
            <Dice5 className="h-4 w-4" />
            <span>Open a random challenge</span>
          </CommandItem>
          <CommandItem
            value="clear filters home"
            onSelect={() => navigateTo('/')}
          >
            <XIcon className="h-4 w-4" />
            <span>Clear filters and go home</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Challenges">
          {items.map((item) => {
            const Icon = CATEGORY_ICON[item.category];
            return (
              <CommandItem
                key={item.slug}
                value={`${item.title} ${item.category} ${item.difficulty} ${(item.tags ?? []).join(' ')}`}
                onSelect={() => navigateTo(getChallengeHref(item))}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1 truncate">{item.title}</span>
                <span className="text-xs capitalize text-muted-foreground">
                  {item.category} · {item.difficulty}
                </span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
