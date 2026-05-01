# Deep Clone

Implement `deepClone<T>(value: T): T` that handles nested objects, arrays, dates, null, and primitives — without `JSON.parse/JSON.stringify`.

## Goals
- Handle all JSON-safe types plus Date
- Avoid shared references between clone and original
- Handle circular references (bonus)
