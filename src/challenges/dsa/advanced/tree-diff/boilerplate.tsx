'use client';

/**
 * 🚧 BOILERPLATE
 *
 * `diffChildren` below uses a naive positional comparison — it compares
 * children by array index, ignoring the `key` field entirely.
 *
 * This produces too many operations for list reorders:
 *   Old: [A, B, C]   New: [B, C, A]
 *   Naïve: 3 UPDATEs   Keyed: 1 MOVE
 *
 * Your goals:
 *  1. Implement a keyed diff: build a Map<key, oldIndex> and classify each
 *     new child as INSERT, UPDATE (if type/props changed), or KEEP.
 *  2. Classify old children not present in new as DELETE.
 *  3. Detect MOVEs: if a kept node's new position ≠ old position, emit MOVE.
 *
 * Hints:
 *  - `const oldMap = new Map(oldChildren.map((n, i) => [n.key, { node: n, index: i }]))`
 *  - Walk newChildren; look up each key in oldMap.
 *  - Walk oldChildren; emit DELETE for keys not seen during the new-child walk.
 *  - Compare old vs new index to detect moves.
 */

import { useState } from 'react';
import { node, type TreeNode, type Patch } from './mock-api';

// ❌ TODO: implement keyed diff — currently positional only
function diffChildren(oldChildren: TreeNode[], newChildren: TreeNode[]): Patch[] {
  const patches: Patch[] = [];
  const maxLen = Math.max(oldChildren.length, newChildren.length);

  for (let i = 0; i < maxLen; i++) {
    const oldNode = oldChildren[i];
    const newNode = newChildren[i];

    if (!oldNode && newNode) {
      // ❌ Inserts are correct, but the key comparison is missing
      patches.push({ op: 'insert', key: newNode.key, node: newNode });
    } else if (oldNode && !newNode) {
      patches.push({ op: 'delete', key: oldNode.key });
    } else if (oldNode && newNode) {
      if (oldNode.type !== newNode.type) {
        // Type change: delete old, insert new
        patches.push({ op: 'delete', key: oldNode.key });
        patches.push({ op: 'insert', key: newNode.key, node: newNode });
      } else {
        // ❌ Compares by position — doesn't detect same-keyed node moved to new index
        const changedProps: Record<string, unknown> = {};
        for (const k of Object.keys(newNode.props)) {
          if (newNode.props[k] !== oldNode.props[k]) changedProps[k] = newNode.props[k];
        }
        if (Object.keys(changedProps).length > 0) {
          patches.push({ op: 'update', key: oldNode.key, props: changedProps });
        }
        // ❌ Missing: check if keys differ → should be DELETE + INSERT or MOVE
      }
    }
  }

  return patches;
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
    expectedOps: 1, // just DELETE a
  },
  {
    name: 'insert at front',
    old: [node('b', 'div'), node('c', 'div')],
    next: [node('a', 'div'), node('b', 'div'), node('c', 'div')],
    expectedOps: 1, // just INSERT a
  },
  {
    name: 'reorder (reverse)',
    old: [node('a', 'div'), node('b', 'div'), node('c', 'div')],
    next: [node('c', 'div'), node('b', 'div'), node('a', 'div')],
    expectedOps: 2, // 2 MOVEs (or 1 MOVE with LIS optimisation)
  },
  {
    name: 'update props',
    old: [node('a', 'div', { text: 'hello' })],
    next: [node('a', 'div', { text: 'world' })],
    expectedOps: 1, // 1 UPDATE
  },
];

export default function TreeDiffBoilerplate(): React.JSX.Element {
  const [results, setResults] = useState<Array<{ name: string; patches: Patch[]; passed: boolean }>>([]);

  const handleRun = (): void => {
    const r = TESTS.map((t) => {
      const patches = diffChildren(t.old, t.next);
      return { name: t.name, patches, passed: patches.length === t.expectedOps };
    });
    setResults(r);
    console.log('--- Tree Diff Tests ---');
    r.forEach((t) => {
      const status = t.passed ? '✓' : '✗';
      if (t.passed) {
        console.log(`${status} ${t.name}: ${t.patches.length} ops`);
      } else {
        console.error(`${status} ${t.name}: ${t.patches.length} ops (expected less)`);
        console.log('  patches:', JSON.stringify(t.patches));
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="mb-1 text-base font-semibold">Tree Diff (Simplified Reconciliation)</h2>
        <p className="text-xs text-muted-foreground">
          Implement keyed diff. Tests pass when the patch count matches the minimal expected operations.
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
    </div>
  );
}
