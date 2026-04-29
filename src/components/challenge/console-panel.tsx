'use client';

import { useEffect, useRef, useState } from 'react';
import { Terminal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

type LogLevel = 'log' | 'info' | 'warn' | 'error';
interface LogEntry {
  id: number;
  level: LogLevel;
  args: unknown[];
  ts: number;
}

const LEVEL_STYLES: Record<LogLevel, string> = {
  log: 'text-foreground',
  info: 'text-blue-500',
  warn: 'text-yellow-500',
  error: 'text-red-500',
};

/**
 * Patches `window.console` while mounted to mirror logs into a panel below the preview.
 * Restores the originals on unmount — critical to avoid leaks between challenge swaps.
 */
export function ConsolePanel(): React.JSX.Element {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const original = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
    };

    const intercept =
      (level: LogLevel) =>
      (...args: unknown[]): void => {
        original[level](...args);
        setLogs((prev) => [...prev, { id: idRef.current++, level, args, ts: Date.now() }]);
      };

    console.log = intercept('log');
    console.info = intercept('info');
    console.warn = intercept('warn');
    console.error = intercept('error');

    return () => {
      console.log = original.log;
      console.info = original.info;
      console.warn = original.warn;
      console.error = original.error;
    };
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Terminal className="h-4 w-4" />
          <span>Console</span>
          {logs.length > 0 ? (
            <span className="text-xs text-muted-foreground">({logs.length})</span>
          ) : null}
        </div>
        <Button variant="ghost" size="sm" onClick={() => setLogs([])} disabled={logs.length === 0}>
          <Trash2 className="h-3.5 w-3.5" />
          <span className="ml-1 text-xs">Clear</span>
        </Button>
      </div>
      <ScrollArea className="flex-1 bg-zinc-950">
        <div className="space-y-0.5 p-3 font-mono text-xs">
          {logs.length === 0 ? (
            <p className="text-muted-foreground">Waiting for output…</p>
          ) : (
            logs.map((entry) => (
              <div key={entry.id} className={cn('flex gap-2', LEVEL_STYLES[entry.level])}>
                <span className="text-muted-foreground">
                  {new Date(entry.ts).toLocaleTimeString('en-US', { hour12: false })}
                </span>
                <span className="uppercase opacity-70">[{entry.level}]</span>
                <span className="break-all">{entry.args.map(formatArg).join(' ')}</span>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function formatArg(arg: unknown): string {
  if (typeof arg === 'string') return arg;
  if (arg instanceof Error) return `${arg.name}: ${arg.message}`;
  try {
    return JSON.stringify(arg);
  } catch {
    return String(arg);
  }
}
