'use client';

/**
 * 🚧 BOILERPLATE
 *
 * The runtime UI just lists the cases. The real work happens at the type level:
 * make the `Expect<Equal<...>>` lines below compile.
 */

// ❌ TODO: implement
type MyPick<T, K extends keyof T> = unknown;
type MyOmit<T, K extends keyof T> = unknown;
type DeepPartial<T> = unknown;
type PromiseValue<T> = unknown;

// --- Type-level tests (these should compile when implementations are correct) ---
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;
type Expect<T extends true> = T;

interface User {
  id: number;
  name: string;
  address: { street: string; city: string };
}

// @ts-expect-error -- not yet implemented
type _t1 = Expect<Equal<MyPick<User, 'id' | 'name'>, { id: number; name: string }>>;
// @ts-expect-error -- not yet implemented
type _t2 = Expect<Equal<MyOmit<User, 'address'>, { id: number; name: string }>>;
// @ts-expect-error -- not yet implemented
type _t3 = Expect<
  Equal<
    DeepPartial<User>,
    { id?: number; name?: string; address?: { street?: string; city?: string } }
  >
>;
// @ts-expect-error -- not yet implemented
type _t4 = Expect<Equal<PromiseValue<Promise<Promise<string>>>, string>>;

export default function GenericUtilityTypesBoilerplate(): React.JSX.Element {
  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold">Build your own utility types</h2>
      <p className="text-sm text-muted-foreground">
        This challenge is type-only. Open the file in your IDE and watch the TS errors
        disappear as you implement each utility correctly.
      </p>
      <ul className="list-inside list-disc space-y-1 text-sm">
        <li>
          <code>MyPick&lt;T, K&gt;</code>
        </li>
        <li>
          <code>MyOmit&lt;T, K&gt;</code>
        </li>
        <li>
          <code>DeepPartial&lt;T&gt;</code>
        </li>
        <li>
          <code>PromiseValue&lt;T&gt;</code>
        </li>
      </ul>
    </div>
  );
}
