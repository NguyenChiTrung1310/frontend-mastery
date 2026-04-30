'use client';

/**
 * 🚧 BOILERPLATE
 *
 * The runtime UI just lists the cases. The real work happens at the type level:
 * make the `Expect<Equal<...>>` lines below compile.
 */

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
