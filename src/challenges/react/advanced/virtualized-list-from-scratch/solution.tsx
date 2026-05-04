'use client';

/**
 * ✅ SOLUTION — Virtualized List from Scratch
 *
 * Core insight: you never need more than ~(containerHeight / itemHeight + 2*overscan)
 * DOM nodes. Everything else is math + one spacer div.
 *
 * How useVirtualizer works:
 *
 *  1. Track `scrollTop` with an onScroll handler.
 *     scrollTop tells us how far the user has scrolled from the top.
 *
 *  2. Calculate the visible window:
 *       startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
 *       endIndex   = Math.min(count - 1,
 *                      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan)
 *
 *  3. Return only the slice [startIndex..endIndex] as virtualItems, each with
 *     its absolute offsetTop = index * itemHeight.
 *
 *  4. A single "runway" div with height = count * itemHeight establishes the
 *     correct scrollbar size. Rows are absolutely positioned inside it.
 *
 * Why overscan?
 *   Without it, a fast scroll reveals empty space for ~1 frame while React
 *   re-renders. 3 rows above + 3 below is cheap and makes scrolling feel native.
 *
 * Why not use @tanstack/react-virtual in production?
 *   You should. Variable-height items, dynamic container sizes, and horizontal
 *   virtualisation are genuinely hard — the library handles them correctly.
 *   This challenge teaches the underlying model so you can debug library issues.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { generateItems, type Item } from './mock-api';

// ─── Inline UI primitives ─────────────────────────────────────────────────────

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
const ITEM_HEIGHT = 64;
const CONTAINER_HEIGHT = 512;
const OVERSCAN = 3;

// ─── ✅ useVirtualizer ────────────────────────────────────────────────────────

interface VirtualItem {
  index: number;
  offsetTop: number;
}
interface VirtualizerResult {
  virtualItems: VirtualItem[];
  totalHeight: number;
  containerRef: React.RefObject<HTMLDivElement>;
}

function useVirtualizer({
  count,
  itemHeight,
  containerHeight,
}: {
  count: number;
  itemHeight: number;
  containerHeight: number;
}): VirtualizerResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Sync scrollTop from the DOM on every scroll event.
  // We do this in a useEffect rather than inline in onScroll so the ref is
  // always current when the handler fires (avoids a stale-closure pitfall).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => setScrollTop(el.scrollTop);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // Core windowing math: which indices fall inside the viewport?
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - OVERSCAN);
  const endIndex = Math.min(
    count - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + OVERSCAN,
  );

  // Build the slice — only ~14 items instead of 10,000.
  const virtualItems: VirtualItem[] = [];
  for (let i = startIndex; i <= endIndex; i++) {
    virtualItems.push({ index: i, offsetTop: i * itemHeight });
  }

  return {
    virtualItems,
    totalHeight: count * itemHeight,
    containerRef,
  };
}

// ─── FPS meter (identical to boilerplate) ────────────────────────────────────

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

export default function VirtualizedListFromScratchSolution(): React.JSX.Element {
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
          addLog('✅ Reached bottom — scrolling back up…');
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
          addLog('🏁 Done — notice the FPS stayed high!');
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
          Only ~{(CONTAINER_HEIGHT / ITEM_HEIGHT + OVERSCAN * 2).toFixed(0)} rows in the DOM at
          any time. Click Measure to see the FPS hold steady.
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <Button onClick={handleMeasure} disabled={measuring}>
          {measuring ? 'Measuring…' : '📏 Measure'}
        </Button>
      </div>

      {/* The list — spacer + absolute-positioned rows */}
      <div
        ref={containerRef}
        style={{ height: CONTAINER_HEIGHT, overflow: 'auto' }}
        className="rounded-md border border-border bg-card"
      >
        {/*
         * Runway div: its height establishes the correct scrollbar size.
         * It does NOT contain all 10,000 rows — just the ~14 visible ones.
         * position:relative makes it the containing block for absolute children.
         */}
        <div style={{ height: totalHeight, position: 'relative' }}>
          {virtualItems.map((v) => {
            const item = ITEMS[v.index];
            // Guard required by noUncheckedIndexedAccess — index is always valid here.
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
        <Badge variant="ok">✅ {virtualItems.length} DOM rows rendered</Badge>
        <Badge variant={fpsVariant}>🎞 {fps} fps</Badge>
        <Badge>🌳 {domCount.toLocaleString()} total DOM nodes</Badge>
        <Badge variant={fps >= 55 ? 'ok' : 'default'}>
          {fps >= 55 ? '🚀 smooth scroll' : '😐 acceptable'}
        </Badge>
      </div>

      {/* Explanation card */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <p className="font-semibold text-sm">✅ Why This Works</p>
        <ul className="space-y-1.5 text-xs text-muted-foreground list-none">
          <li>
            <span className="text-foreground font-medium">Only render what&apos;s visible:</span>{' '}
            <code className="rounded bg-muted px-1">startIndex = Math.floor(scrollTop / itemHeight)</code>{' '}
            to{' '}
            <code className="rounded bg-muted px-1">
              endIndex = Math.ceil((scrollTop + containerHeight) / itemHeight)
            </code>{' '}
            — that&apos;s ~8 rows for a 512px container with 64px items.
          </li>
          <li>
            <span className="text-foreground font-medium">A single spacer div</span> with{' '}
            <code className="rounded bg-muted px-1">height = count × itemHeight</code> maintains
            the correct scrollbar size and position without any real rows behind it.
          </li>
          <li>
            <span className="text-foreground font-medium">Overscan (3 rows above + below)</span>{' '}
            pre-renders just outside the viewport so fast scrolls never reveal a flash of empty
            space while React catches up.
          </li>
        </ul>

        {/* Before/after code panel */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-md border border-red-800 bg-red-950/40 p-3">
            <p className="text-xs font-semibold text-red-400 mb-2">❌ Before</p>
            <pre className="text-xs text-red-200 whitespace-pre-wrap">{`// 10,000 DOM nodes
items.map(item => (
  <Row key={item.id} data={item} />
))`}</pre>
          </div>
          <div className="rounded-md border border-green-800 bg-green-950/40 p-3">
            <p className="text-xs font-semibold text-green-400 mb-2">✅ After</p>
            <pre className="text-xs text-green-200 whitespace-pre-wrap">{`// ~14 DOM nodes
virtualItems.map(v => (
  <Row
    key={v.index}
    style={{
      position: 'absolute',
      top: v.offsetTop,
    }}
    data={items[v.index]}
  />
))`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
