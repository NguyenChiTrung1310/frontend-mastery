'use client';

// ❌ Broken implementations
Function.prototype.myCall = function(_thisArg: unknown, ...args: unknown[]) {
  // BUG: ignores thisArg entirely
  return (this as (...a: unknown[]) => unknown)(...args);
};

Function.prototype.myApply = function(_thisArg: unknown, args: unknown[]) {
  // BUG: ignores thisArg
  return (this as (...a: unknown[]) => unknown)(...(args ?? []));
};

Function.prototype.myBind = function(_thisArg: unknown, ...partialArgs: unknown[]) {
  // BUG: ignores thisArg, returns unbound function
  const fn = this as (...a: unknown[]) => unknown;
  return (...args: unknown[]) => fn(...partialArgs, ...args);
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

export default function BindCallApplyBoilerplate(): React.JSX.Element {
  const callResult = greet.myCall(obj, 'Hello');
  const applyResult = greet.myApply(obj, ['Hi']);
  const boundGreet = greet.myBind(obj, 'Hey');
  const bindResult = boundGreet();

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold">bind / call / apply</h2>
      <div className="text-sm font-mono space-y-1">
        <p>myCall: {String(callResult)} <span className="text-red-500">(expected &quot;Hello, Alice!&quot;)</span></p>
        <p>myApply: {String(applyResult)} <span className="text-red-500">(expected &quot;Hi, Alice!&quot;)</span></p>
        <p>myBind: {String(bindResult)} <span className="text-red-500">(expected &quot;Hey, Alice!&quot;)</span></p>
      </div>
    </div>
  );
}
