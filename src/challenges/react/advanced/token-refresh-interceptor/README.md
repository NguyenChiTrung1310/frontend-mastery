# Token Refresh Interceptor — Silent Re-authentication

## 🎯 Scenario

Your SPA uses short-lived access tokens. The user has been idle and their token expires. When they
resume and trigger 5 simultaneous API calls, every request comes back `401 Unauthorized`.

A naive implementation catches each 401 and independently fires a `POST /auth/refresh-token` —
which means 5 refresh calls instead of 1. The server may rate-limit you, issue 5 different tokens
(only the last survives), or log 5 suspicious re-auth events.

Your task: implement an axios response interceptor that enforces **exactly one refresh** regardless
of how many requests hit 401 at the same time.

---

## ❓ Why This Matters — The Thundering Herd

When multiple requests expire simultaneously:

```
T=0ms  /data1 → 401
T=0ms  /data2 → 401
T=0ms  /data3 → 401   (all arrive concurrently)
T=0ms  /data4 → 401
T=0ms  /data5 → 401
```

Without coordination, each interceptor independently fires `POST /refresh-token`:

```
T=1ms  POST /refresh-token (from /data1 handler)
T=1ms  POST /refresh-token (from /data2 handler)   ← unnecessary
T=1ms  POST /refresh-token (from /data3 handler)   ← unnecessary
...
```

This is the **thundering herd problem** at the HTTP layer. The correct solution serialises the
refresh: one request wins the race, the rest queue up and wait.

---

## 🧠 The Pattern — isRefreshing + failedQueue + processQueue

Three module-level variables coordinate the refresh:

```ts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null): void => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
};
```

**The decision tree inside the 401 handler:**

```
401 received?
├── originalRequest._retry === true?
│   └── YES → reject (already retried, don't loop)
├── isRefreshing === true?
│   └── YES → push { resolve, reject } to failedQueue, return queued Promise
└── isRefreshing === false (first 401)
    ├── set isRefreshing = true, set originalRequest._retry = true
    ├── POST /auth/refresh-token
    │   ├── SUCCESS → storeAccessToken(newToken), processQueue(null, newToken),
    │   │             retry originalRequest with new token
    │   └── FAILURE → processQueue(error, null), reject originalRequest
    └── finally: isRefreshing = false
```

### Why `failedQueue` stores callbacks, not requests

Each entry is `{ resolve, reject }` tied to a `new Promise(...)` that the interceptor returned
to the original caller. When `processQueue` drains the queue, each `resolve(token)` callback
re-attaches the Authorization header and calls `api(originalRequest)` — retrying the specific
request that was waiting. This avoids re-running any application logic.

---

## ✅ Tasks

### Task 1 — See the bug

Open the boilerplate. Click "Fire 5 Requests". Watch all 5 fail with 401.
The "Refresh calls" badge stays at 0 — the response interceptor is a no-op stub.

### Task 2 — Add the `isRefreshing` gate

In `mock-api-boilerplate.ts`, implement the response interceptor. Start with just the flag:

```ts
api.interceptors.response.use(
  (res) => res,
  async (err: unknown) => {
    // narrow err to access .response and .config
    if (status !== 401 || originalRequest._retry) return Promise.reject(err);
    originalRequest._retry = true;
    isRefreshing = true;
    try {
      const { data } = await api.post<{ accessToken: string }>('/auth/refresh-token');
      storeAccessToken(data.accessToken);
      originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
      return api(originalRequest);
    } finally {
      isRefreshing = false;
    }
  }
);
```

Now 1 request refreshes. But the other 4 still fail — they need the queue.

### Task 3 — Add the queue

Before the refresh block, add the `isRefreshing` guard:

```ts
if (isRefreshing) {
  return new Promise((resolve, reject) => {
    failedQueue.push({
      resolve: (token: string) => {
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        resolve(api(originalRequest));
      },
      reject,
    });
  });
}
```

Then add `processQueue(null, data.accessToken)` on success and
`processQueue(error, null)` on failure.

### Task 4 — Handle the `_retry` flag type

TypeScript won't let you assign `_retry` to `InternalAxiosRequestConfig` directly.
Use a type intersection:

```ts
type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };
const originalRequest = axiosErr.config as RetryableConfig;
```

---

## 💡 Gotchas

- **`_retry` is critical.** Without it, the retried request (which also goes through the
  interceptor) would trigger another refresh — infinite loop.
- **`isRefreshing` must be module-level**, not component state. React state is async; by the time
  `setState` commits, the second 401 has already read the stale `false` value.
- **`processQueue` must clear the queue.** If you forget `failedQueue = []`, the next batch of
  401s will re-resolve the old callbacks.
- **What if the refresh fails?** `processQueue(error, null)` rejects all queued promises so each
  caller receives a real error. Don't silently swallow — the UI needs to know to redirect to login.

---

## 🔗 Relationship to the Race Condition Challenge

Both `use-fetch-race-condition` and this challenge are **concurrency problems** — they just live
at different layers:

| Challenge | Layer | Problem | Solution |
|---|---|---|---|
| `use-fetch-race-condition` | React state | Stale responses overwrite fresh UI | AbortController + cleanup |
| `token-refresh-interceptor` | HTTP client | N 401s trigger N refreshes | isRefreshing queue |

Both require you to think about what happens when multiple async operations compete for a shared
resource (UI state vs. refresh endpoint).

---

## 🔍 When to use a library

Roll your own when:
- You're learning the pattern (this challenge)
- Your axios setup has unusual retry logic the library can't accommodate

Use `axios-auth-refresh` or `ky`'s built-in retry hooks in production:
- They handle edge cases (concurrent refresh requests, refresh token rotation, multi-tab)
- They're tested across browser environments

---

## 🔍 Reference

- [axios-auth-refresh](https://github.com/Flyrell/axios-auth-refresh) — popular library for this exact pattern
- [axios interceptors docs](https://axios-http.com/docs/interceptors)
- [RFC 6750 — Bearer Token Usage](https://datatracker.ietf.org/doc/html/rfc6750)
