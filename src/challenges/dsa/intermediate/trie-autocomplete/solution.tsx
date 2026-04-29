'use client';

/**
 * ✅ SOLUTION — Trie with insert, search, and startsWith
 *
 * Why Map over a plain object for children?
 *   Map has guaranteed O(1) get/set and preserves insertion order. A plain
 *   `{ [char: string]: TrieNode }` would also work, but Map avoids prototype
 *   pollution (`children["constructor"]` would be a problem with a plain object).
 *
 * The DFS in `collect`:
 *   We carry the accumulated `path` string down the recursive calls. When we
 *   hit an `isEnd` node, the full word is `prefix + path`. This avoids
 *   allocating a full word string at every node — only at word boundaries.
 *
 *   Alternatively, you could store the full word at each `isEnd` node
 *   (e.g. `word: string | null`) to avoid rebuilding the string from path.
 *   That trades memory (full word stored N times for N-char words) for
 *   slightly faster collection. For most autocomplete use-cases, the DFS
 *   path rebuild is fast enough.
 *
 * `maxResults` early exit:
 *   Once `results.length >= maxResults`, we stop DFS entirely. This is an
 *   important optimisation: for a 2-character prefix in a large dictionary
 *   there could be thousands of matches; collecting all of them defeats the
 *   purpose of the Trie's speed advantage.
 *
 * `startsWith` complexity: O(m) where m = prefix length. Just walk the tree.
 */

import { useMemo, useState } from 'react';
import { WORD_LIST } from './mock-api';

interface TrieNode {
  children: Map<string, TrieNode>;
  isEnd: boolean;
}

function createNode(): TrieNode {
  return { children: new Map(), isEnd: false };
}

class Trie {
  private readonly root: TrieNode = createNode();

  insert(word: string): void {
    let node = this.root;
    for (const ch of word.toLowerCase()) {
      if (!node.children.has(ch)) {
        node.children.set(ch, createNode());
      }
      // Non-null assertion safe: we just set the key in the line above.
      node = node.children.get(ch)!;
    }
    node.isEnd = true;
  }

  search(prefix: string, maxResults = 10): string[] {
    let node = this.root;
    const lower = prefix.toLowerCase();

    // Walk to the prefix node; return empty if prefix not in trie.
    for (const ch of lower) {
      const next = node.children.get(ch);
      if (!next) return [];
      node = next;
    }

    const results: string[] = [];
    this.collect(node, lower, results, maxResults);
    return results;
  }

  startsWith(prefix: string): boolean {
    let node = this.root;
    for (const ch of prefix.toLowerCase()) {
      const next = node.children.get(ch);
      if (!next) return false;
      node = next;
    }
    return true;
  }

  // DFS: accumulates words starting from `node`, prepending `prefix` to each.
  private collect(
    node: TrieNode,
    prefix: string,
    results: string[],
    max: number,
  ): void {
    if (results.length >= max) return; // early exit
    if (node.isEnd) results.push(prefix);
    for (const [ch, child] of node.children) {
      if (results.length >= max) return;
      this.collect(child, prefix + ch, results, max);
    }
  }
}

const trie = new Trie();
for (const word of WORD_LIST) {
  trie.insert(word);
}

export default function TrieAutocompleteSolution(): React.JSX.Element {
  const [query, setQuery] = useState('');

  const suggestions = useMemo(
    () => (query ? trie.search(query.toLowerCase(), 8) : []),
    [query],
  );

  const hasPrefix = query ? trie.startsWith(query.toLowerCase()) : true;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="mb-1 text-base font-semibold">Trie Autocomplete (O(prefix) lookup)</h2>
        <p className="text-xs text-muted-foreground">
          Try: &quot;re&quot;, &quot;use&quot;, &quot;type&quot;, &quot;com&quot;. O(m + k) per query — m = prefix length, k = results.
        </p>
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type a prefix…"
        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      {query ? (
        <p className="text-xs text-muted-foreground">
          startsWith(&quot;{query}&quot;):{' '}
          <strong className={hasPrefix ? 'text-green-600' : 'text-red-500'}>
            {String(hasPrefix)}
          </strong>
          {' · '}{suggestions.length} suggestions
        </p>
      ) : null}
      <ul className="min-h-[80px] rounded-md border p-2">
        {suggestions.length > 0 ? (
          suggestions.map((w) => (
            <li
              key={w}
              onClick={() => setQuery(w)}
              className="cursor-pointer rounded px-2 py-1 text-sm hover:bg-accent"
            >
              <span className="font-medium text-primary">{query}</span>
              {w.slice(query.length)}
            </li>
          ))
        ) : (
          <li className="p-2 text-xs text-muted-foreground">
            {query ? 'No matches in dictionary.' : 'Start typing…'}
          </li>
        )}
      </ul>
    </div>
  );
}
