'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { TechFilter } from '@/lib/challenge-search';

const TABS: ReadonlyArray<{ value: TechFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'react', label: 'React' },
  { value: 'nextjs', label: 'Next.js' },
  { value: 'dsa', label: 'DSA' },
];

interface TechTabsProps {
  value: TechFilter;
  onChange: (value: TechFilter) => void;
}

export function TechTabs({ value, onChange }: TechTabsProps): React.JSX.Element {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as TechFilter)}>
      <TabsList>
        {TABS.map((t) => (
          <TabsTrigger key={t.value} value={t.value}>
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
