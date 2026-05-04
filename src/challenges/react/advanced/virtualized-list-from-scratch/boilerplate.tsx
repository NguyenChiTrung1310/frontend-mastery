'use client';

/**
 * 🚧 BOILERPLATE
 *
 * This list renders ALL 10,000 items into the DOM at once.
 * Watch the "DOM Node Count" badge and "Scroll FPS" meter to feel the pain.
 *
 * Your task: replace the naive render with a `useVirtualizer` hook that only
 * renders the rows currently visible in the viewport + a small overscan buffer.
 *
 * Hints:
 *  - Track scrollTop with an onScroll handler on the container div (use a ref).
 *  - startIndex = Math.floor(scrollTop / itemHeight)
 *  - endIndex   = Math.ceil((scrollTop + containerHeight) / itemHeight)
 *  - Add overscan of 3 above and below to prevent flash-of-empty on fast scroll.
 *  - The container needs a fixed height (512px here). The inner "runway" div
 *    has height = count * itemHeight. Rows use position:absolute + top:offsetTop.
 *  - Use v.index as the React key — not offsetTop.
 *  - Remember: items[v.index] is Item | undefined with noUncheckedIndexedAccess.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { generateItems, type Item } from './mock-api';

// ─── Inline UI primitives (Tailwind only — no @/components/ui imports) ────────

const Badge = ({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'warn' | 'ok';
}) => {
  const colors =
    variant === 'warn'
      ? 'bg-yellow-500/20 text-yellow-400 border-yellow-600'
      : variant === 'ok'
        ? 'bg-green-500/20 text-green-400 border-green-600'
        : 'bg-muted text-muted-foreground border-border';
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-mono ${colors}`}>
      {children}
    </span>
  );
};

const Button = ({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
  >
    {children}
  </button>
);

// ─── Constants ────────────────────────────────────────────────────────────────

const ITEM_COUNT = 10_000;
const ITEM_HEIGHT = 64; // px — fixed height per row
const CONTAINER_HEIGHT = 512; // px — fixed viewport height

// ─── ❌ TODO: implement useVirtualizer ────────────────────────────────────────
// For now it just returns all indices — that's the bug.
interface VirtualItem {
  index: number;
  offsetTop: number;
}
interface VirtualizerResult {
  virtualItems: VirtualItem[];
  totalHeight: number;
  containerRef: React.RefObject<HTMLDivElement>;
}

function useVirtualizer(_options: {
  count: number;
  itemHeight: number;
  containerHeight: number;
}): VirtualizerResult {
  const containerRef = useRef<HTMLDivElement>(null);

  // ❌ TODO: track scrollTop and compute only the visible slice
  // Right now we return ALL items — this is the naive broken behaviour.
  const allItems: VirtualItem[] = Array.from({ length: _options.count }, (_, i) => ({
    index: i,
    offsetTop: i * _options.itemHeight,
  }));

  return {
    virtualItems: allItems, // ❌ should be only the ~15 visible items
    totalHeight: _options.count * _options.itemHeight,
    containerRef,
  };
}

// ─── FPS meter ────────────────────────────────────────────────────────────────

function useFpsMeter(): number {
  const [fps, setFps] = useState(60);
  const frameTimesRef = useRef<number[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    let last = performance.now();
    const tick = (now: number) => {
      const delta = now - last;
      last = now;
      frameTimesRef.current.push(delta);
      if (frameTimesRef.current.length > 30) frameTimesRef.current.shift();
      const avg =
        frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
      setFps(Math.round(1000 / avg));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return fps;
}

// ─── DOM node counter ─────────────────────────────────────────────────────────

function useDomNodeCount(): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const update = () => setCount(document.querySelectorAll('*').length);
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return count;
}

// ─── Main component ───────────────────────────────────────────────────────────

const ITEMS: Item[] = generateItems(ITEM_COUNT);

export default function VirtualizedListFromScratchBoilerplate(): React.JSX.Element {
  const [logs, setLogs] = useState<string[]>([]);
  const [measuring, setMeasuring] = useState(false);
  const fps = useFpsMeter();
  const domCount = useDomNodeCount();

  const addLog = useCallback(
    (msg: string) =>
      setLogs((prev) =>
        [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50),
      ),
    [],
  );

  const { virtualItems, totalHeight, containerRef } = useVirtualizer({
    count: ITEM_COUNT,
    itemHeight: ITEM_HEIGHT,
    containerHeight: CONTAINER_HEIGHT,
  });

  // Programmatic scroll-to-bottom-and-back to stress-test FPS
  const handleMeasure = useCallback(async () => {
    const container = containerRef.current;
    if (!container || measuring) return;
    setMeasuring(true);
    addLog('⏳ Scrolling to bottom…');

    const maxScroll = totalHeight - CONTAINER_HEIGHT;
    const step = Math.ceil(maxScroll / 60);
    let pos = 0;

    await new Promise<void>((resolve) => {
      const down = () => {
        pos += step;
        if (pos >= maxScroll) {
          container.scrollTop = maxScroll;
          addLog('⚠️ Reached bottom — scrolling back up…');
          resolve();
          return;
        }
        container.scrollTop = pos;
        requestAnimationFrame(down);
      };
      requestAnimationFrame(down);
    });

    await new Promise<void>((resolve) => {
      const up = () => {
        pos -= step;
        if (pos <= 0) {
          container.scrollTop = 0;
          addLog('🏁 Done — check the FPS meter above');
          resolve();
          return;
        }
        container.scrollTop = pos;
        requestAnimationFrame(up);
      };
      requestAnimationFrame(up);
    });

    setMeasuring(false);
  }, [containerRef, totalHeight, measuring, addLog]);

  const fpsVariant = fps < 30 ? 'warn' : fps >= 55 ? 'ok' : 'default';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold">Virtualized List from Scratch</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          All {ITEM_COUNT.toLocaleString()} items are in the DOM. Click Measure to feel the pain.
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <Button onClick={handleMeasure} disabled={measuring}>
          {measuring ? 'Measuring…' : '📏 Measure'}
        </Button>
      </div>

      {/* The list */}
      <div
        ref={containerRef}
        style={{ height: CONTAINER_HEIGHT, overflow: 'auto' }}
        className="rounded-md border border-border bg-card"
      >
        {/* ❌ Naive: all items rendered, no spacer, no absolute positioning */}
        <div style={{ height: totalHeight, position: 'relative' }}>
          {virtualItems.map((v) => {
            const item = ITEMS[v.index];
            if (!item) return null;
            return (
              <div
                key={v.index}
                style={{ position: 'absolute', top: v.offsetTop, height: ITEM_HEIGHT }}
                className="w-full flex items-center gap-3 border-b border-border px-4"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-mono text-muted-foreground">
                  {v.index}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
                </div>
                <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                  {item.category}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event log */}
      <div className="rounded-md border bg-muted/30 p-3 font-mono text-xs max-h-32 overflow-y-auto space-y-1">
        {logs.length === 0 ? (
          <p className="text-muted-foreground">No events yet… click Measure to start.</p>
        ) : (
          logs.map((log, i) => <p key={i}>{log}</p>)
        )}
      </div>

      {/* Status badges */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="warn">⚠️ {virtualItems.length.toLocaleString()} DOM rows rendered</Badge>
        <Badge variant={fpsVariant}>🎞 {fps} fps</Badge>
        <Badge>🌳 {domCount.toLocaleString()} total DOM nodes</Badge>
        <Badge variant={fps < 30 ? 'warn' : 'default'}>
          {fps < 30 ? '🐌 scroll is janky' : fps < 55 ? '😐 acceptable' : '✅ smooth'}
        </Badge>
      </div>
    </div>
  );
}
