# Trie for Autocomplete

## 🎯 Scenario

You're building an autocomplete box for a code editor. The dictionary has 50,000 words. For every character the user types, you need all words that start with the current prefix.

With a flat array, that's `O(n × m)` per query (n words, m prefix length) — 50,000 string comparisons on every keystroke. With a Trie, it's `O(m)` to reach the prefix node, then `O(k)` to collect `k` results. The Trie wins by orders of magnitude for large dictionaries.

---

## 📂 Files

- `boilerplate.tsx` — An interactive autocomplete stub backed by a broken Trie. Edit this.
- `solution.tsx` — A working Trie with `insert`, `search`, and `startsWith`. 
- `mock-api.ts` — A word list for the Trie.

---

## ❓ Why Trie Beats HashMap for Prefix Queries

A HashMap gives you O(1) exact-key lookup, but there's no efficient way to find all keys that *start with* a prefix. You'd still have to scan every key.

A Trie stores characters as edges in a tree. To find all words starting with `"re"`:
1. Walk edges `r` → `e` — `O(m)` where m is prefix length.
2. Collect all leaf nodes below that node — `O(k)` where k is result count.

For a dictionary of 50,000 words with average length 8, and a 3-character prefix, the Trie does about 3 + k comparisons versus 50,000 × 3 for the array scan.

---

## 🧠 Trie Structure

```
insert("cat"), insert("car"), insert("card"), insert("care")

         root
          |
          c
          |
          a
         / \
        t   r
           / \
          d   e
```

Each node:
```ts
interface TrieNode {
  children: Map<string, TrieNode>;
  isEnd: boolean; // marks a complete word
}
```

`insert("cat")`:
1. Start at root.
2. Follow/create edge for `c`, then `a`, then `t`.
3. Mark the `t` node as `isEnd = true`.

`search("ca")` (prefix search):
1. Walk root → `c` → `a`.
2. Collect all words in the subtree rooted at `a`.

---

## ✅ Tasks

### Task 1 — `insert(word)`

Walk the trie, creating nodes for missing characters, and mark the final node as `isEnd`.

### Task 2 — `search(prefix): string[]`

Walk to the prefix node, then DFS to collect all complete words below it.

### Task 3 — `startsWith(prefix): boolean`

Return `true` if any word in the trie starts with `prefix`. O(m) — just walk the path.

### Task 4 — Limit results

Add a `maxResults` parameter so `search` returns at most N words (stops the DFS early).

### Task 5 — Bonus: delete

`delete(word)` — remove a word while preserving the trie structure for other words that share its prefix.

---

## 💡 Gotchas

- **`isEnd` vs leaf node** — a node can be both `isEnd = true` (word terminates here) and have children (longer words share the prefix). Don't conflate "end of word" with "leaf".
- **Empty prefix** — `search("")` should return all words. Decide on a max results cap or the UI will freeze.
- **Case sensitivity** — insert and search should normalise to lowercase (or upper — just be consistent).
- **DFS vs BFS** — DFS with a stack is typically faster in practice for collecting prefix matches because the collected path string grows naturally.

---

## 🔍 Reference

- [LeetCode 208: Implement Trie](https://leetcode.com/problems/implement-trie-prefix-tree/)
- [LeetCode 212: Word Search II (Trie + backtracking)](https://leetcode.com/problems/word-search-ii/)
- [Trie visualization tool](https://www.cs.usfca.edu/~galles/visualization/Trie.html)
