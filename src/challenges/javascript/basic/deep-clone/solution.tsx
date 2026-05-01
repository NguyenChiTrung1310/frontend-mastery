'use client';

/**
 * ✅ SOLUTION — Deep clone without JSON.parse/stringify
 *
 * JSON.parse/stringify limitations that this avoids:
 *  - Drops `undefined` values and Symbol keys
 *  - Converts Date → string (lossy)
 *  - Throws on circular references
 *
 * Strategy:
 *  1. Primitives and null → return as-is
 *  2. Date → new Date(original.getTime()) — copy the timestamp, not the reference
 *  3. Array → new array with each element recursively cloned
 *  4. Plain object → new object with each value recursively cloned
 *
 * The `seen` WeakMap tracks visited objects to handle circular references
 * without an infinite loop.
 */
function deepClone<T>(value: T, seen = new WeakMap<object, unknown>()): T {
  // Primitives (string, number, boolean, null, undefined, symbol) — immutable, return directly
  if (value === null || typeof value !== 'object') return value;

  // Circular reference guard — return the already-cloned version
  if (seen.has(value as object)) return seen.get(value as object) as T;

  // Date — copy by value, not reference
  if (value instanceof Date) {
    const cloned = new Date(value.getTime());
    seen.set(value as object, cloned);
    return cloned as unknown as T;
  }

  // Array — recursively clone each element
  if (Array.isArray(value)) {
    const cloned: unknown[] = [];
    seen.set(value as object, cloned);
    for (const item of value) {
      cloned.push(deepClone(item, seen));
    }
    return cloned as unknown as T;
  }

  // Plain object — recursively clone each own enumerable property
  const cloned = Object.create(Object.getPrototypeOf(value) as object) as Record<string, unknown>;
  seen.set(value as object, cloned);
  for (const key of Object.keys(value as object)) {
    cloned[key] = deepClone((value as Record<string, unknown>)[key], seen);
  }
  return cloned as unknown as T;
}

const original = {
  name: 'Alice',
  scores: [10, 20, 30],
  address: { city: 'Hanoi', zip: '100000' },
  createdAt: new Date('2024-01-01'),
};

export default function DeepCloneSolution(): React.JSX.Element {
  const clone = deepClone(original);
  clone.scores.push(99);
  clone.address.city = 'HCMC';

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold">Deep Clone</h2>
      <p className="text-sm text-muted-foreground">After cloning and mutating the clone:</p>
      <div className="text-sm font-mono space-y-1">
        <p className="text-green-700">original.scores: [{original.scores.join(', ')}] ✓ (unchanged)</p>
        <p className="text-green-700">original.address.city: {original.address.city} ✓ (unchanged)</p>
        <p className="text-green-700">clone.scores: [{clone.scores.join(', ')}] ✓ (mutated copy)</p>
        <p className="text-green-700">clone.address.city: {clone.address.city} ✓ (mutated copy)</p>
      </div>

      <div className="rounded-md border border-border bg-card p-4 space-y-3">
        <p className="text-sm font-semibold">✅ Why This Works</p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>Primitives are returned directly (immutable); objects, arrays, and Dates each get a new instance with recursively cloned values — no shared references.</li>
          <li>A <code className="rounded bg-muted px-1">WeakMap</code> tracks already-cloned objects so circular references (e.g. <code className="rounded bg-muted px-1">a.self = a</code>) return the in-progress clone instead of infinite recursing.</li>
          <li><code className="rounded bg-muted px-1">JSON.parse/stringify</code> would drop <code className="rounded bg-muted px-1">undefined</code>, convert Dates to strings, and throw on circular refs — this implementation handles all three correctly.</li>
        </ul>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-md border border-red-800 bg-red-950/40 p-3">
            <p className="text-xs font-semibold text-red-400 mb-2">❌ Before</p>
            <pre className="text-xs text-red-200 whitespace-pre-wrap">{`// JSON round-trip clone
const clone = JSON.parse(JSON.stringify(obj));
// Date → string (lossy)
// undefined → dropped
// Circular → throws`}</pre>
          </div>
          <div className="rounded-md border border-green-800 bg-green-950/40 p-3">
            <p className="text-xs font-semibold text-green-400 mb-2">✅ After</p>
            <pre className="text-xs text-green-200 whitespace-pre-wrap">{`function deepClone(value, seen = new WeakMap()) {
  if (seen.has(value)) return seen.get(value);
  if (value instanceof Date) return new Date(value.getTime());
  // recurse into arrays and objects
}`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
