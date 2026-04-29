'use client';

/**
 * ✅ SOLUTION
 *
 * Notes:
 * - `MyPick` is a mapped type indexed over the constrained K.
 * - `MyOmit` is built by excluding K from `keyof T` then re-mapping.
 * - `DeepPartial` recurses only into object types — not primitives, not arrays
 *   of primitives. The `T extends object` guard is what stops infinite recursion
 *   on string/number/boolean.
 * - `PromiseValue` uses `infer` and recursion to peel nested promises.
 */

type MyPick<T, K extends keyof T> = { [P in K]: T[P] };

type MyOmit<T, K extends keyof T> = { [P in Exclude<keyof T, K>]: T[P] };

type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

type PromiseValue<T> = T extends Promise<infer U> ? PromiseValue<U> : T;

// --- Type-level tests pass ✓ ---
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;
type Expect<T extends true> = T;

interface User {
  id: number;
  name: string;
  address: { street: string; city: string };
}

type _t1 = Expect<Equal<MyPick<User, 'id' | 'name'>, { id: number; name: string }>>;
type _t2 = Expect<Equal<MyOmit<User, 'address'>, { id: number; name: string }>>;
type _t3 = Expect<
  Equal<
    DeepPartial<User>,
    { id?: number; name?: string; address?: { street?: string; city?: string } }
  >
>;
type _t4 = Expect<Equal<PromiseValue<Promise<Promise<string>>>, string>>;

export default function GenericUtilityTypesSolution(): React.JSX.Element {
  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold">All four utility types — implemented</h2>
      <p className="text-sm text-muted-foreground">
        Compare each line with your boilerplate. The recursion in <code>DeepPartial</code>{' '}
        and <code>PromiseValue</code> is the key insight.
      </p>
    </div>
  );
}
