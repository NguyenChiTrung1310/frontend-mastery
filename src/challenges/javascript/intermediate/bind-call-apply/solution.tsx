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

      <div className="rounded-md border border-border bg-card p-4 space-y-3">
        <p className="text-sm font-semibold">✅ Why This Works</p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li><code className="rounded bg-muted px-1">call</code> works by temporarily grafting the function onto <code className="rounded bg-muted px-1">thisArg</code> as a Symbol-keyed method — calling it as <code className="rounded bg-muted px-1">obj[sym]()</code> makes JS set <code className="rounded bg-muted px-1">this</code> to <code className="rounded bg-muted px-1">obj</code>.</li>
          <li><code className="rounded bg-muted px-1">apply</code> delegates to <code className="rounded bg-muted px-1">call</code> by spreading the args array — the entire implementation is one line.</li>
          <li><code className="rounded bg-muted px-1">bind</code> returns a closure that closes over <code className="rounded bg-muted px-1">thisArg</code> and any pre-filled partial args — partial application comes for free.</li>
        </ul>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-md border border-red-800 bg-red-950/40 p-3">
            <p className="text-xs font-semibold text-red-400 mb-2">❌ Before</p>
            <pre className="text-xs text-red-200 whitespace-pre-wrap">{"// Broken — 'this' is always wrong\nFunction.prototype.myCall = function(ctx) {\n  return this(); // ignores ctx entirely\n}"}</pre>
          </div>
          <div className="rounded-md border border-green-800 bg-green-950/40 p-3">
            <p className="text-xs font-semibold text-green-400 mb-2">✅ After</p>
            <pre className="text-xs text-green-200 whitespace-pre-wrap">{"Function.prototype.myCall = function(ctx, ...args) {\n  const sym = Symbol();\n  ctx[sym] = this;          // graft fn as method\n  const r = ctx[sym](...args); // call with correct 'this'\n  delete ctx[sym];\n  return r;\n}"}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
