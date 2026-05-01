'use client';

// ❌ All stubs — they do not work
function myMap<T, U>(_arr: T[], _fn: (item: T, index: number, array: T[]) => U): U[] {
  // TODO: iterate and apply fn to each element
  return [];
}

function myFilter<T>(_arr: T[], _fn: (item: T, index: number, array: T[]) => boolean): T[] {
  // TODO: keep elements where fn returns true
  return [];
}

function myReduce<T, U>(_arr: T[], _fn: (acc: U, item: T, index: number) => U, initial: U): U {
  // TODO: fold left with an accumulator
  return initial;
}

function myFlatMap<T, U>(_arr: T[], _fn: (item: T, index: number) => U | U[]): U[] {
  // TODO: map then flatten one level
  return [];
}

const nums = [1, 2, 3, 4, 5];

export default function ArrayMethodReimplementationBoilerplate(): React.JSX.Element {
  const doubled = myMap(nums, x => x * 2);
  const evens = myFilter(nums, x => x % 2 === 0);
  const sum = myReduce(nums, (acc, x) => acc + x, 0);
  const pairs = myFlatMap(nums, x => [x, x * 10]);

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold">Array Method Reimplementation</h2>
      <div className="space-y-1 text-sm font-mono">
        <p>myMap doubled: [{doubled.join(', ')}] <span className="text-red-500">(expected [2,4,6,8,10])</span></p>
        <p>myFilter evens: [{evens.join(', ')}] <span className="text-red-500">(expected [2,4])</span></p>
        <p>myReduce sum: {sum} <span className="text-red-500">(expected 15)</span></p>
        <p>myFlatMap pairs: [{pairs.join(', ')}] <span className="text-red-500">(expected [1,10,2,20,...])</span></p>
      </div>
    </div>
  );
}
