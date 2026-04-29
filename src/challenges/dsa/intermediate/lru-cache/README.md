# LRU Cache (O(1))

## 🎯 Scenario

Implement an LRU (Least Recently Used) cache where both `get` and `put` run in **O(1)**.

This is one of the most common system design / algorithm interview questions, and a real building block — every modern HTTP cache, every memoization library, and every React Query under the hood uses some flavor of LRU.

## 📋 Requirements

```
class LRUCache<K, V> {
  constructor(capacity: number);
  get(key: K): V | undefined;     // O(1) — also marks key as most recently used
  put(key: K, value: V): void;     // O(1) — evicts least recently used when at capacity
  get size(): number;
}
```

## 🧠 The Trick

A `Map` alone gives you O(1) get/put but doesn't track recency cheaply.
A linked list alone tracks recency but has O(n) lookup.

**Combine them.** A doubly-linked list for ordering + a `Map<K, Node>` for lookup. On `get`, find the node via the map, splice it from its current position, push it to the head. On `put` over capacity, drop the tail node and remove its key from the map.

Alternative: just use the JavaScript `Map`. It iterates in insertion order, so `delete` + `set` re-positions a key to the end. This is the cleanest O(1) implementation in JS — but understand the doubly-linked-list version too, because that's what's expected in interviews using languages without insertion-ordered maps.

## ✅ Tasks

1. Implement `LRUCache` with both `get` and `put` running in O(1).
2. Pass the test cases printed in the console panel.
3. Bonus: implement `[Symbol.iterator]` so it can be `for...of`'d in MRU → LRU order.

## 🔍 Reference

- [LeetCode 146 — LRU Cache](https://leetcode.com/problems/lru-cache/)
