'use client';

/**
 * 🚧 BOILERPLATE
 *
 * The Trie below has stub `insert` and `search` methods that do nothing.
 * As a result, the autocomplete always shows no results.
 *
 * Your tasks:
 *  1. Implement `insert(word)` — walk/create nodes, mark isEnd on the last character.
 *  2. Implement `search(prefix, maxResults?)` — walk to the prefix node, DFS to collect words.
 *  3. Implement `startsWith(prefix): boolean` — O(m) prefix existence check.
 *
 * Hints:
 *  - Each node: `{ children: Map<string, TrieNode>, isEnd: boolean }`
 *  - insert: for each char, `node = node.children.get(ch) ?? createNewNode()`
 *  - search: reach prefix node, then DFS collecting the running `path` string
 *  - DFS: if node.isEnd push `prefix + path`, then recurse into each child
 *  - Normalise to lowercase
 */

import { useState, useMemo } from 'react';
import { WORD_LIST } from './mock-api';

interface TrieNode {
  children: Map<string, TrieNode>;
  isEnd: boolean;
}

function createNode(): TrieNode {
  return { children: new Map(), isEnd: false };
}

class Trie {
  private root: TrieNode = createNode();

  // ❌ TODO: implement
  insert(_word: string): void {
    // walk root → chars → mark isEnd
  }

  // ❌ TODO: implement
  search(_prefix: string, _maxResults = 10): string[] {
    // walk to prefix node, DFS collect words
    return [];
  }

  // ❌ TODO: implement
  startsWith(_prefix: string): boolean {
    return false;
  }
}

// Build trie once at module level
const trie = new Trie();
for (const word of WORD_LIST) {
  trie.insert(word);
}

export default function TrieAutocompleteBoilerplate(): React.JSX.Element {
  const [query, setQuery] = useState('');

  const suggestions = useMemo(
    () => (query ? trie.search(query.toLowerCase(), 8) : []),
    [query],
  );

  const hasPrefix = query ? trie.startsWith(query.toLowerCase()) : true;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="mb-1 text-base font-semibold">Trie Autocomplete</h2>
        <p className="text-xs text-muted-foreground">
          Try: &quot;re&quot;, &quot;use&quot;, &quot;type&quot;, &quot;com&quot;. Implement insert/search to see results.
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
          startsWith(&quot;{query}&quot;): <strong>{String(hasPrefix)}</strong>
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
              {w}
            </li>
          ))
        ) : (
          <li className="p-2 text-xs text-muted-foreground">
            {query ? 'No results — implement search()' : 'Start typing…'}
          </li>
        )}
      </ul>
    </div>
  );
}
