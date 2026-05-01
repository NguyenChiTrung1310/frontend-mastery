'use client';

/**
 * ✅ SOLUTION — Array method internals
 *
 * Key observations:
 *  - map/filter/flatMap never mutate the original; they always return a new array.
 *  - The callback receives (element, index, originalArray) — matching the spec.
 *  - reduce accumulates a running value starting from `initial`.
 *  - flatMap = map + one level of flatten (not deep flatten).
 *
 * These implementations mirror the ECMA spec behaviour.
 */

function myMap<T, U>(arr: T[], fn: (item: T, index: number, array: T[]) => U): U[] {
  const result: U[] = [];
  for (let i = 0; i < arr.length; i++) {
    // Pass (element, index, original array) — same contract as native .map
    result.push(fn(arr[i]!, i, arr));
  }
  return result;
}

function myFilter<T>(arr: T[], fn: (item: T, index: number, array: T[]) => boolean): T[] {
  const result: T[] = [];
  for (let i = 0; i < arr.length; i++) {
    // Only include elements for which the predicate returns truthy
    if (fn(arr[i]!, i, arr)) result.push(arr[i]!);
  }
  return result;
}

function myReduce<T, U>(arr: T[], fn: (acc: U, item: T, index: number) => U, initial: U): U {
  let acc = initial;
  for (let i = 0; i < arr.length; i++) {
    // Each iteration feeds the previous acc + current element → new acc
    acc = fn(acc, arr[i]!, i);
  }
  return acc;
}

function myFlatMap<T, U>(arr: T[], fn: (item: T, index: number) => U | U[]): U[] {
  const result: U[] = [];
  for (let i = 0; i < arr.length; i++) {
    const val = fn(arr[i]!, i);
    // Flatten one level: if the callback returns an array, spread its items
    if (Array.isArray(val)) {
      for (const item of val) result.push(item);
    } else {
      result.push(val);
    }
  }
  return result;
}

const nums = [1, 2, 3, 4, 5];

export default function ArrayMethodReimplementationSolution(): React.JSX.Element {
  const doubled = myMap(nums, x => x * 2);
  const evens = myFilter(nums, x => x % 2 === 0);
  const sum = myReduce(nums, (acc, x) => acc + x, 0);
  const pairs = myFlatMap(nums, x => [x, x * 10]);

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold">Array Method Reimplementation</h2>
      <div className="space-y-1 text-sm font-mono">
        <p className="text-green-700">myMap doubled: [{doubled.join(', ')}] ✓</p>
        <p className="text-green-700">myFilter evens: [{evens.join(', ')}] ✓</p>
        <p className="text-green-700">myReduce sum: {sum} ✓</p>
        <p className="text-green-700">myFlatMap pairs: [{pairs.join(', ')}] ✓</p>
      </div>
    </div>
  );
}
