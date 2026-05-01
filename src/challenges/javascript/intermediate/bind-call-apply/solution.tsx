'use client';

/**
 * ✅ SOLUTION — myCall, myApply, myBind
 *
 * The fundamental trick for call/apply:
 *   JavaScript sets `this` to the object a method is called ON.
 *   So to call `fn` with `thisArg` as `this`:
 *     1. Assign fn as a property of thisArg: thisArg[sym] = fn
 *     2. Call it as a method: thisArg[sym](...args)  ← `this` is now thisArg
 *     3. Delete the temporary property to leave no trace
 *
 *   We use a Symbol key to avoid colliding with existing properties.
 *
 * bind:
 *   Returns a NEW function that closes over thisArg.
 *   When called, it uses myCall to invoke the original fn with the bound thisArg.
 *   Also pre-fills partial args (same as partial application).
 */

const sym = Symbol('myThis');

Function.prototype.myCall = function(thisArg: unknown, ...args: unknown[]): unknown {
  // Normalize thisArg: null/undefined → globalThis (non-strict behaviour)
  const ctx = (thisArg ?? globalThis) as Record<symbol, unknown>;
  // Temporarily graft this function onto the target object as a method
  ctx[sym] = this;
  const result = (ctx[sym] as (...a: unknown[]) => unknown)(...args);
  // Clean up so we don&apos;t leave a dangling property
  delete ctx[sym];
  return result;
};

Function.prototype.myApply = function(thisArg: unknown, args?: unknown[]): unknown {
  // apply is just call with spread — delegate
  return (this as { myCall: (ctx: unknown, ...a: unknown[]) => unknown })
    .myCall(thisArg, ...(args ?? []));
};

Function.prototype.myBind = function(thisArg: unknown, ...partialArgs: unknown[]) {
  const fn = this as { myCall: (ctx: unknown, ...a: unknown[]) => unknown };
  // Return a closure that remembers thisArg and any pre-filled args
  return function(this: unknown, ...callArgs: unknown[]) {
    return fn.myCall(thisArg, ...partialArgs, ...callArgs);
  };
};

declare global {
  interface Function {
    myCall(thisArg: unknown, ...args: unknown[]): unknown;
    myApply(thisArg: unknown, args?: unknown[]): unknown;
    myBind(thisArg: unknown, ...args: unknown[]): (...a: unknown[]) => unknown;
  }
}

const obj = { name: 'Alice' };
function greet(this: { name: string }, greeting: string) {
  return `${greeting}, ${this.name}!`;
}

export default function BindCallApplySolution(): React.JSX.Element {
  const callResult = greet.myCall(obj, 'Hello');
  const applyResult = greet.myApply(obj, ['Hi']);
  const boundGreet = greet.myBind(obj, 'Hey');
  const bindResult = boundGreet();

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold">bind / call / apply — Fixed</h2>
      <div className="text-sm font-mono space-y-1">
        <p className="text-green-700">myCall: {String(callResult)} ✓</p>
        <p className="text-green-700">myApply: {String(applyResult)} ✓</p>
        <p className="text-green-700">myBind: {String(bindResult)} ✓</p>
      </div>
    </div>
  );
}
