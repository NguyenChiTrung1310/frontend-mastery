# Event Loop Trace

Read five code snippets and predict the console output order. Each snippet mixes synchronous code, Promises (microtask queue), and setTimeout (macrotask queue).

## Goals
- Understand the difference between microtask queue (Promise callbacks) and macrotask queue (setTimeout)
- Know that microtasks drain completely before the next macrotask runs
- Predict output order without running the code
