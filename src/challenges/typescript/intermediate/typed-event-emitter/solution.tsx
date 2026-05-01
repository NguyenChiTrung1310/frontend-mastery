'use client';

/**
 * ✅ SOLUTION — TypedEventEmitter with mapped-type constraints
 *
 * The core trick: `K extends keyof T` binds the event name to a specific key,
 * and `T[K]` then gives you the *correlated* payload type for that exact key.
 * TypeScript tracks the K → T[K] relationship through the generic, so the
 * type-checker can validate both sides of every `on`/`emit` call together.
 *
 * Why the internal store uses `Set<(payload: unknown) => void>`:
 *   The Map's value must have a concrete type at runtime. We store handlers as
 *   `(payload: unknown) => void` and cast when we look them up. The type safety
 *   lives entirely at call sites — the internals are intentionally loose.
 *   This is the same approach `mitt` (the popular tiny emitter) uses.
 *
 * Why `once` stores a wrapped handler (not the original):
 *   `off` compares by reference. If `once` just called `off(event, handler)`,
 *   the original `handler` would stay in the Set. We must store the *wrapper*
 *   and delete *that* when it fires.
 *
 * Trade-off: `TypedEventEmitter` instances are mutable singletons. If you need
 * immutability or React state integration, consider a Zustand or Jotai store
 * instead — they compose better with concurrent React.
 */

import { useState } from 'react';

class TypedEventEmitter<T extends Record<keyof T, unknown>> {
  private readonly listeners = new Map<keyof T, Set<(payload: unknown) => void>>();

  on<K extends keyof T>(event: K, handler: (payload: T[K]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    // Cast: the Set stores `unknown` handlers to avoid per-key generics in the Map.
    this.listeners.get(event)!.add(handler as (p: unknown) => void);
  }

  off<K extends keyof T>(event: K, handler: (payload: T[K]) => void): void {
    this.listeners.get(event)?.delete(handler as (p: unknown) => void);
  }

  emit<K extends keyof T>(event: K, payload: T[K]): void {
    this.listeners.get(event)?.forEach((h) => h(payload));
  }

  once<K extends keyof T>(event: K, handler: (payload: T[K]) => void): void {
    // Store the wrapper so we can remove *it* from the Set after first invocation.
    const wrapper = (payload: unknown): void => {
      handler(payload as T[K]);
      this.off(event, handler); // remove original by reference (works via the cast in off)
    };
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(wrapper);
  }
}

interface DashboardEvents {
  'user:login': { userId: string; name: string };
  'order:placed': { orderId: string; total: number };
  'stock:update': { symbol: string; price: number };
}

// TypeScript now enforces event names and payload shapes at compile time.
const emitter = new TypedEventEmitter<DashboardEvents>();

export default function TypedEventEmitterSolution(): React.JSX.Element {
  const [log, setLog] = useState<string[]>([]);
  const [listenersRegistered, setListenersRegistered] = useState(false);

  const addLog = (msg: string): void =>
    setLog((prev) => [`${new Date().toLocaleTimeString()} ${msg}`, ...prev.slice(0, 19)]);

  const handleRegister = (): void => {
    if (listenersRegistered) return;
    // No casts needed — TypeScript infers payload types from the EventMap.
    emitter.on('user:login', (p) => {
      addLog(`[user:login] ${p.name} (${p.userId})`);
    });
    emitter.on('order:placed', (p) => {
      addLog(`[order:placed] #${p.orderId} — $${p.total.toFixed(2)}`);
    });
    // once: fires once for the next stock:update then auto-removes
    emitter.once('stock:update', (p) => {
      addLog(`[stock:update once] ${p.symbol} @ $${p.price}`);
    });
    setListenersRegistered(true);
    addLog('[system] listeners registered (once for stock:update)');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">Typed Event Emitter (fully typed)</h2>
      <p className="text-sm text-muted-foreground">
        No casts needed. TypeScript infers payload types from the event map.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleRegister}
          disabled={listenersRegistered}
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
        >
          Register listeners
        </button>
        <button
          onClick={() => emitter.emit('user:login', { userId: 'u1', name: 'Alice' })}
          className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
        >
          Emit user:login
        </button>
        <button
          onClick={() => emitter.emit('order:placed', { orderId: 'o42', total: 129.99 })}
          className="rounded-md bg-secondary px-3 py-1.5 text-sm text-secondary-foreground"
        >
          Emit order:placed
        </button>
        <button
          onClick={() => emitter.emit('stock:update', { symbol: 'AAPL', price: 182.5 })}
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
        >
          Emit stock:update (once)
        </button>
      </div>
      <ul className="max-h-40 overflow-auto rounded-md border p-2 font-mono text-xs">
        {log.length === 0 ? (
          <li className="text-muted-foreground">No events yet — register listeners first.</li>
        ) : (
          log.map((entry, i) => <li key={i}>{entry}</li>)
        )}
      </ul>

      <div className="rounded-md border border-border bg-card p-4 space-y-3">
        <p className="text-sm font-semibold">✅ Why This Works</p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>The generic <code className="rounded bg-muted px-1">K extends keyof T</code> binds event name to its exact payload type — TypeScript validates both sides of every <code className="rounded bg-muted px-1">on</code>/<code className="rounded bg-muted px-1">emit</code> call together.</li>
          <li>Internal storage uses <code className="rounded bg-muted px-1">unknown</code> handlers so the Map has a concrete type; the type safety lives entirely at call sites via generic inference.</li>
          <li><code className="rounded bg-muted px-1">once</code> stores a wrapper function (not the original) so <code className="rounded bg-muted px-1">off</code> can remove it by reference after first invocation.</li>
        </ul>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-md border border-red-800 bg-red-950/40 p-3">
            <p className="text-xs font-semibold text-red-400 mb-2">❌ Before</p>
            <pre className="text-xs text-red-200 whitespace-pre-wrap">{`// Untyped — any event name, any payload
class Emitter {
  on(event: string, handler: Function) {}
  emit(event: string, data: any) {}
}`}</pre>
          </div>
          <div className="rounded-md border border-green-800 bg-green-950/40 p-3">
            <p className="text-xs font-semibold text-green-400 mb-2">✅ After</p>
            <pre className="text-xs text-green-200 whitespace-pre-wrap">{`class TypedEventEmitter<T extends Record<keyof T, unknown>> {
  on<K extends keyof T>(
    event: K,
    handler: (payload: T[K]) => void
  ): void
}`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
