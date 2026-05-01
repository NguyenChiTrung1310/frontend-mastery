'use client';

/**
 * ✅ SOLUTION — Keyed tree diff (simplified React reconciliation)
 *
 * The algorithm in three passes:
 *
 *  Pass 1 — Index old children by key.
 *    `Map<key, { node, oldIndex }>` — O(n) build, O(1) lookup.
 *
 *  Pass 2 — Walk new children.
 *    For each newChild:
 *    - Not in old map → INSERT.
 *    - In old map, same type → KEEP (diff props → UPDATE). Track oldIndex.
 *    - In old map, different type → DELETE old + INSERT new (type change destroys instance).
 *    Mark seen keys so Pass 3 knows what was consumed.
 *
 *  Pass 3 — Walk old children.
 *    Any old child whose key was NOT seen in Pass 2 → DELETE.
 *
 *  Move detection (after the three passes):
 *    We have a list of [oldIndex, newIndex] pairs for kept nodes.
 *    Nodes already in strictly increasing oldIndex order don't need to move —
 *    they're already in the right relative order (LIS insight).
 *    Nodes NOT in the LIS → emit MOVE.
 *
 * Why LIS?
 *   Consider old [A,B,C,D] → new [A,C,B,D].
 *   Old indices for kept nodes: A=0, C=2, B=1, D=3.
 *   LIS of [0,2,1,3] = [0,2,3] → A, C, D don't move.
 *   Only B needs a MOVE patch (insertBefore). 1 op vs 2 naive ops.
 *
 * This is the core of Snabbdom's and React's list reconciliation.
 */

import { useState } from 'react';
import { node, type TreeNode, type Patch } from './mock-api';

function diffChildren(oldChildren: TreeNode[], newChildren: TreeNode[]): Patch[] {
  const patches: Patch[] = [];

  // Pass 1: index old by key
  const oldMap = new Map(
    oldChildren.map((n, i) => [n.key, { node: n, oldIndex: i }]),
  );

  const seenKeys = new Set<string>();
  // Pairs of [oldIndex, newIndex] for nodes that were kept (not inserted/deleted).
  const keptOldIndices: number[] = [];
  const keptNewIndices: number[] = [];

  // Pass 2: walk new children
  for (let newIndex = 0; newIndex < newChildren.length; newIndex++) {
    const newChild = newChildren[newIndex]!;
    const oldEntry = oldMap.get(newChild.key);

    if (!oldEntry) {
      // Key not in old tree — INSERT
      patches.push({ op: 'insert', key: newChild.key, node: newChild });
    } else if (oldEntry.node.type !== newChild.type) {
      // Same key, different type — React destroys and recreates
      patches.push({ op: 'delete', key: oldEntry.node.key });
      patches.push({ op: 'insert', key: newChild.key, node: newChild });
    } else {
      // Same key, same type — KEEP. Check for prop changes.
      const changedProps: Record<string, unknown> = {};
      const allKeys = new Set([
        ...Object.keys(oldEntry.node.props),
        ...Object.keys(newChild.props),
      ]);
      for (const k of allKeys) {
        if (oldEntry.node.props[k] !== newChild.props[k]) {
          changedProps[k] = newChild.props[k];
        }
      }
      if (Object.keys(changedProps).length > 0) {
        patches.push({ op: 'update', key: newChild.key, props: changedProps });
      }
      // Record position for move detection
      keptOldIndices.push(oldEntry.oldIndex);
      keptNewIndices.push(newIndex);
      seenKeys.add(newChild.key);
    }
  }

  // Pass 3: delete old nodes not present in new
  for (const [key] of oldMap) {
    if (!seenKeys.has(key)) {
      patches.push({ op: 'delete', key });
    }
  }

  // Move detection via LIS
  // Nodes whose old indices form a strictly increasing sequence are already in
  // relative order — they don't need a MOVE. Everything else does.
  const lisIndices = new Set(longestIncreasingSubsequence(keptOldIndices));
  for (let i = 0; i < keptOldIndices.length; i++) {
    if (!lisIndices.has(i)) {
      // This kept node is NOT in the LIS — it needs to move.
      const newIndex = keptNewIndices[i];
      const oldIdx = keptOldIndices[i];
      const node = oldIdx !== undefined ? oldChildren[oldIdx] : undefined;
      if (newIndex !== undefined && node !== undefined) {
        patches.push({ op: 'move', key: node.key, toIndex: newIndex });
      }
    }
  }

  return patches;
}

/**
 * Returns the *indices* (not values) of the longest increasing subsequence of `arr`.
 * O(n log n) using patience sort with binary search.
 */
function longestIncreasingSubsequence(arr: number[]): number[] {
  const n = arr.length;
  if (n === 0) return [];

  const tails: number[] = [];  // tails[i] = smallest tail of all LIS of length i+1
  const tailIndices: number[] = []; // index into arr for each tail
  const predecessors: number[] = new Array(n).fill(-1);
  const indices: number[] = []; // maps tails[] position → arr index

  for (let i = 0; i < n; i++) {
    const val = arr[i]!;
    // Binary search for leftmost tail >= val
    let lo = 0;
    let hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid]! < val) lo = mid + 1;
      else hi = mid;
    }
    tails[lo] = val;
    indices[lo] = i;
    tailIndices[i] = lo;
    if (lo > 0) predecessors[i] = indices[lo - 1]!;
  }

  // Reconstruct path
  const lisLength = tails.length;
  const result: number[] = new Array(lisLength);
  let k = indices[lisLength - 1]!;
  for (let i = lisLength - 1; i >= 0; i--) {
    result[i] = k;
    k = predecessors[k]!;
  }
  return result;
}

interface TestCase {
  name: string;
  old: TreeNode[];
  next: TreeNode[];
  expectedOps: number;
}

const TESTS: TestCase[] = [
  {
    name: 'delete from front',
    old: [node('a', 'div'), node('b', 'div'), node('c', 'div')],
    next: [node('b', 'div'), node('c', 'div')],
    expectedOps: 1,
  },
  {
    name: 'insert at front',
    old: [node('b', 'div'), node('c', 'div')],
    next: [node('a', 'div'), node('b', 'div'), node('c', 'div')],
    expectedOps: 1,
  },
  {
    name: 'reorder (reverse)',
    old: [node('a', 'div'), node('b', 'div'), node('c', 'div')],
    next: [node('c', 'div'), node('b', 'div'), node('a', 'div')],
    expectedOps: 2, // 2 MOVEs (LIS = [c] length 1, so a and b need to move)
  },
  {
    name: 'update props',
    old: [node('a', 'div', { text: 'hello' })],
    next: [node('a', 'div', { text: 'world' })],
    expectedOps: 1,
  },
];

export default function TreeDiffSolution(): React.JSX.Element {
  const [results, setResults] = useState<Array<{ name: string; patches: Patch[]; passed: boolean }>>([]);

  const handleRun = (): void => {
    const r = TESTS.map((t) => {
      const patches = diffChildren(t.old, t.next);
      return { name: t.name, patches, passed: patches.length === t.expectedOps };
    });
    setResults(r);
    console.log('--- Tree Diff Tests (Solution) ---');
    r.forEach((t) => {
      const status = t.passed ? '✓' : '✗';
      if (t.passed) {
        console.log(`${status} ${t.name}: ${t.patches.length} ops`);
      } else {
        console.error(`${status} ${t.name}: ${t.patches.length} ops (expected ${TESTS.find(x => x.name === t.name)?.expectedOps})`);
        console.log('  patches:', JSON.stringify(t.patches));
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="mb-1 text-base font-semibold">Tree Diff — Keyed + LIS</h2>
        <p className="text-xs text-muted-foreground">
          Keyed diff with LIS move optimisation. Each test produces the minimal patch set.
        </p>
      </div>
      <button
        onClick={handleRun}
        className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
      >
        Run tests
      </button>
      {results.length > 0 ? (
        <ul className="space-y-2 text-sm">
          {results.map((r) => (
            <li key={r.name}>
              <span className={r.passed ? 'text-green-600' : 'text-red-600'}>
                {r.passed ? '✓' : '✗'} {r.name}
              </span>
              <span className="ml-2 text-xs text-muted-foreground">
                {r.patches.length} patches: [{r.patches.map((p) => p.op).join(', ')}]
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="rounded-md border border-border bg-card p-4 space-y-3">
        <p className="text-sm font-semibold">✅ Why This Works</p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>Three passes — index old by key, walk new children for inserts/updates/deletes, then sweep old for remaining deletes — keep the algorithm O(n) per level.</li>
          <li>Type change on same key triggers DELETE + INSERT because changing component type destroys the existing DOM/fiber instance — the same rule React itself uses.</li>
          <li>LIS (Longest Increasing Subsequence) on kept nodes&apos; old indices finds the minimal set of MOVE operations — nodes already in relative order stay put.</li>
        </ul>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-md border border-red-800 bg-red-950/40 p-3">
            <p className="text-xs font-semibold text-red-400 mb-2">❌ Before</p>
            <pre className="text-xs text-red-200 whitespace-pre-wrap">{`// Naive: compare by index, not key
// [A,B,C] → [C,B,A] = 3 replaces
// Keys ignored → full subtree destruction`}</pre>
          </div>
          <div className="rounded-md border border-green-800 bg-green-950/40 p-3">
            <p className="text-xs font-semibold text-green-400 mb-2">✅ After</p>
            <pre className="text-xs text-green-200 whitespace-pre-wrap">{`// Keyed + LIS: [A,B,C] → [C,B,A]
// LIS = [C] length 1
// Only A and B emit MOVE (2 ops)`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
