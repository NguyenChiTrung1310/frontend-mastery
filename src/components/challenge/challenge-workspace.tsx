'use client';

import { useState, type ComponentType } from 'react';
import { Columns2, Square, Eye, Lightbulb } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Markdown } from '@/components/challenge/markdown';
import { ConsolePanel } from '@/components/challenge/console-panel';
import { PreviewErrorBoundary } from '@/components/challenge/preview-error-boundary';
import type { ChallengeMeta } from '@/lib/types';
import { cn } from '@/lib/utils';

type ViewMode = 'split' | 'boilerplate' | 'solution';

interface ChallengeWorkspaceProps {
  meta: ChallengeMeta;
  readme: string;
  Boilerplate: ComponentType;
  Solution: ComponentType;
  showConsole?: boolean;
}

export function ChallengeWorkspace({
  meta,
  readme,
  Boilerplate,
  Solution,
  showConsole = false,
}: ChallengeWorkspaceProps): React.JSX.Element {
  const [mode, setMode] = useState<ViewMode>('split');

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-background px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {meta.category}
              </Badge>
              <Badge
                variant={meta.difficulty === 'advanced' ? 'destructive' : 'secondary'}
                className="capitalize"
              >
                {meta.difficulty}
              </Badge>
              {meta.estimatedMinutes !== undefined ? (
                <span className="text-xs text-muted-foreground">
                  ~{meta.estimatedMinutes} min
                </span>
              ) : null}
            </div>
            <h1 className="text-xl font-semibold leading-tight">{meta.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{meta.description}</p>
          </div>
          <ViewModeToggle mode={mode} onChange={setMode} />
        </div>
      </header>

      {/* Body: instructions on left, preview(s) on right */}
      <div className="grid flex-1 grid-cols-[420px_1fr] overflow-hidden">
        <aside className="border-r bg-card">
          <ScrollArea className="h-full">
            <div className="p-6">
              <Markdown content={readme} />
            </div>
          </ScrollArea>
        </aside>

        <main className="flex flex-col overflow-hidden">
          <div
            className={cn(
              'grid flex-1 overflow-hidden',
              mode === 'split' ? 'grid-cols-2' : 'grid-cols-1',
            )}
          >
            {mode !== 'solution' ? (
              <PreviewPane
                title="Your Work"
                subtitle="boilerplate.tsx"
                icon={<Eye className="h-4 w-4 text-blue-500" />}
              >
                <PreviewErrorBoundary label="Boilerplate">
                  <Boilerplate />
                </PreviewErrorBoundary>
              </PreviewPane>
            ) : null}

            {mode !== 'boilerplate' ? (
              <PreviewPane
                title="Expert Solution"
                subtitle="solution.tsx"
                icon={<Lightbulb className="h-4 w-4 text-amber-500" />}
                bordered={mode === 'split'}
              >
                <PreviewErrorBoundary label="Solution">
                  <Solution />
                </PreviewErrorBoundary>
              </PreviewPane>
            ) : null}
          </div>

          {showConsole ? (
            <div className="h-56 shrink-0 border-t">
              <ConsolePanel />
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}

interface PreviewPaneProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  bordered?: boolean;
  children: React.ReactNode;
}

function PreviewPane({
  title,
  subtitle,
  icon,
  bordered,
  children,
}: PreviewPaneProps): React.JSX.Element {
  return (
    <section className={cn('flex flex-col overflow-hidden', bordered && 'border-l')}>
      <div className="flex items-center gap-2 border-b bg-card/50 px-4 py-2">
        {icon}
        <span className="text-sm font-medium">{title}</span>
        <code className="ml-auto rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
          {subtitle}
        </code>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-6">{children}</div>
      </ScrollArea>
    </section>
  );
}

interface ViewModeToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

function ViewModeToggle({ mode, onChange }: ViewModeToggleProps): React.JSX.Element {
  return (
    <Tabs value={mode} onValueChange={(v) => onChange(v as ViewMode)}>
      <TabsList>
        <TabsTrigger value="boilerplate">
          <Square className="mr-1.5 h-3.5 w-3.5" />
          Mine
        </TabsTrigger>
        <TabsTrigger value="split">
          <Columns2 className="mr-1.5 h-3.5 w-3.5" />
          Split
        </TabsTrigger>
        <TabsTrigger value="solution">
          <Lightbulb className="mr-1.5 h-3.5 w-3.5" />
          Solution
        </TabsTrigger>
      </TabsList>
      {/* Hidden — Tabs is used purely for keyboard semantics */}
      <TabsContent value="boilerplate" className="hidden" />
      <TabsContent value="split" className="hidden" />
      <TabsContent value="solution" className="hidden" />
    </Tabs>
  );
}
