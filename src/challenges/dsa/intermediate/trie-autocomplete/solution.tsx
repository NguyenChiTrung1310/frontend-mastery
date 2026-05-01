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

      <div className="rounded-md border border-border bg-card p-4 space-y-3">
        <p className="text-sm font-semibold">✅ Why This Works</p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>Prefix lookup is O(m) where m = prefix length — walk the tree one character at a time until reaching the prefix node or finding a missing branch.</li>
          <li>The DFS <code className="rounded bg-muted px-1">collect</code> builds words by accumulating the path string, yielding only at <code className="rounded bg-muted px-1">isEnd</code> nodes — no full-word storage at every node.</li>
          <li>The <code className="rounded bg-muted px-1">maxResults</code> early exit stops DFS after collecting enough suggestions — critical for short prefixes that would match thousands of words.</li>
        </ul>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-md border border-red-800 bg-red-950/40 p-3">
            <p className="text-xs font-semibold text-red-400 mb-2">❌ Before</p>
            <pre className="text-xs text-red-200 whitespace-pre-wrap">{`// Linear scan — O(n * m) per query
words.filter(w => w.startsWith(prefix))
// gets slower as dictionary grows`}</pre>
          </div>
          <div className="rounded-md border border-green-800 bg-green-950/40 p-3">
            <p className="text-xs font-semibold text-green-400 mb-2">✅ After</p>
            <pre className="text-xs text-green-200 whitespace-pre-wrap">{`// O(m + k) — m=prefix, k=results
trie.search(prefix, maxResults)
// complexity independent of dict size`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
