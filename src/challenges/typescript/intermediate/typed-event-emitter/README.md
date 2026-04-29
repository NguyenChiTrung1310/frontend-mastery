# Type-safe Event Emitter

## 🎯 Scenario

You're building a real-time dashboard. Multiple components subscribe to events like `"user:login"`, `"order:placed"`, and `"stock:update"`. The current emitter accepts any `string` for the event name and `any` for the payload — so `emitter.on("user:lonig", handler)` silently does nothing because of a typo, and `handler` receives `any`.

Your job: build a generic `TypedEventEmitter<EventMap>` where the event names are constrained to the keys of `EventMap`, and the payload type for each listener is automatically inferred from the map.

---

## 📂 Files

- `boilerplate.tsx` — A working but untyped emitter. Edit this.
- `solution.tsx` — Fully typed emitter with explanations.
- `mock-api.ts` — No mock needed; this is a type-level challenge.

---

## ❓ Why This Matters

Node's `EventEmitter` and browser `EventTarget` both suffer from the same problem: string event names with untyped payloads. Every wrong event name or mismatched payload is a silent runtime bug.

TypeScript's mapped types let you express: *"for event name K, the handler receives EventMap[K] as its argument"*. This turns a class of invisible runtime bugs into compile-time errors.

This pattern appears in:
- WebSocket message dispatching
- Redux action handling (pre-toolkit)
- Cross-component event buses
- Custom DOM event types

---

## 🧠 The Mapped Type Trick

```ts
type EventMap = {
  'user:login': { userId: string; timestamp: number };
  'order:placed': { orderId: string; total: number };
};

class TypedEventEmitter<T extends Record<string, unknown>> {
  on<K extends keyof T>(event: K, handler: (payload: T[K]) => void): void { ... }
  emit<K extends keyof T>(event: K, payload: T[K]): void { ... }
  off<K extends keyof T>(event: K, handler: (payload: T[K]) => void): void { ... }
}
```

The magic: `K extends keyof T` constrains the event name, and `T[K]` gives you the payload type *for that specific event*. The type system tracks the correlation between name and payload.

---

## ✅ Tasks

### Task 1 — Generic class

Make `TypedEventEmitter<T>` generic over an `EventMap`. The `on`, `emit`, and `off` methods must all be typed correctly.

### Task 2 — Type tests

The following should all produce TypeScript errors:

```ts
const emitter = new TypedEventEmitter<MyEvents>();

// Wrong event name
emitter.on('user:lonig', handler);  // ❌ typo

// Wrong payload type
emitter.emit('user:login', { userId: 42 }); // ❌ number, not string

// Handler receives wrong type
emitter.on('order:placed', (p: { userId: string }) => {}); // ❌ wrong shape
```

### Task 3 — `once` method

Add `once<K>(event: K, handler: (payload: T[K]) => void): void` — fires once then auto-removes itself.

### Task 4 — Bonus: `EventEmitter.create<T>()` factory

Create a factory function (instead of a constructor) that returns a typed emitter as a plain object with `on`, `off`, `emit`, `once` methods. This avoids class inheritance issues when composing emitters.

---

## 💡 Gotchas

- **`keyof T` narrows to a union** — if `T` has 3 events, `K extends keyof T` allows all 3 strings. TypeScript won't let you pass a 4th.
- **`Map<keyof T, Set<Function>>`** — you'll need a cast somewhere since the Set's generic `Function` type erases the payload correlation. That's unavoidable: the type safety is at the *call site*, not in the internal store.
- **`off` must compare by reference** — `Set.delete(handler)` only works if you pass the exact same function reference you passed to `on`. Closures created inline won't be removable.
- **`once` wraps the handler** — the inner wrapper must be what you delete from the Set, not the original. Store a reference to it.

---

## 🔍 Reference

- [TypeScript Handbook: Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- [TypeScript Handbook: Indexed Access Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html)
- [mitt — tiny typed event emitter (excellent reference implementation)](https://github.com/developit/mitt)
