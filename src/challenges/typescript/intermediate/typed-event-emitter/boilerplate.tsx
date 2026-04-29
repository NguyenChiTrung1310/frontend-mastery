'use client';

/**
 * 🚧 BOILERPLATE
 *
 * `TypedEventEmitter` below accepts any string event name and an untyped payload.
 * Typos in event names are silent no-ops. Handler payload types are not checked.
 *
 * Your goal: make the class generic so:
 *  - `on(event, handler)` only accepts event names in T and infers the payload type.
 *  - `emit(event, payload)` enforces the payload matches T[event].
 *  - `off(event, handler)` removes the correct handler.
 *  - `once(event, handler)` fires exactly once then auto-removes itself.
 *
 * Hints:
 *  - `class TypedEventEmitter<T extends Record<string, unknown>>`
 *  - `on<K extends keyof T>(event: K, handler: (payload: T[K]) => void): void`
 *  - Internal store: `Map<keyof T, Set<(payload: unknown) => void>>`
 *    (the Set loses generic info — that's fine; type safety is at call sites)
 */

import { useState } from 'react';

// ❌ TODO: make this generic — change the class to TypedEventEmitter<T extends Record<keyof T, unknown>>
class TypedEventEmitter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private listeners = new Map<string, Set<(payload: any) => void>>();

  // ❌ `event: string` should be `K extends keyof T`
  // ❌ payload type should be `T[K]`
  on(event: string, handler: (payload: unknown) => void): void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(handler);
  }

  off(event: string, handler: (payload: unknown) => void): void {
    this.listeners.get(event)?.delete(handler);
  }

  emit(event: string, payload: unknown): void {
    this.listeners.get(event)?.forEach((h) => h(payload));
  }

  // ❌ TODO: implement — currently doesn't auto-remove
  once(event: string, handler: (payload: unknown) => void): void {
    this.on(event, handler);
  }
}

interface DashboardEvents {
  'user:login': { userId: string; name: string };
  'order:placed': { orderId: string; total: number };
  'stock:update': { symbol: string; price: number };
}

// After your fix, this line should be:
//   const emitter = new TypedEventEmitter<DashboardEvents>();
// and the casts inside the handlers should become unnecessary.
const emitter = new TypedEventEmitter();

export default function TypedEventEmitterBoilerplate(): React.JSX.Element {
  const [log, setLog] = useState<string[]>([]);
  const [listenersRegistered, setListenersRegistered] = useState(false);

  const addLog = (msg: string): void =>
    setLog((prev) => [`${new Date().toLocaleTimeString()} ${msg}`, ...prev.slice(0, 19)]);

  const handleRegister = (): void => {
    if (listenersRegistered) return;
    emitter.on('user:login', (p) => {
      // ❌ Must cast because `p` is `unknown`. Fix the emitter so this is inferred.
      const payload = p as DashboardEvents['user:login'];
      addLog(`[user:login] ${payload.name} (${payload.userId})`);
    });
    emitter.on('order:placed', (p) => {
      const payload = p as DashboardEvents['order:placed'];
      addLog(`[order:placed] #${payload.orderId} — $${payload.total.toFixed(2)}`);
    });
    setListenersRegistered(true);
    addLog('[system] listeners registered');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">Typed Event Emitter</h2>
      <p className="text-sm text-muted-foreground">
        Open the file in your IDE. Make the emitter generic, then remove all the manual casts.
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
      </div>
      <ul className="max-h-40 overflow-auto rounded-md border p-2 font-mono text-xs">
        {log.length === 0 ? (
          <li className="text-muted-foreground">No events yet — register listeners first.</li>
        ) : (
          log.map((entry, i) => <li key={i}>{entry}</li>)
        )}
      </ul>
    </div>
  );
}
