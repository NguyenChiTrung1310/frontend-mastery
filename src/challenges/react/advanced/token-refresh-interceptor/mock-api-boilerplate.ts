// Boilerplate axios instance — request interceptor only.
// The response interceptor is intentionally missing: all 401s fail immediately.

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { createTokenStore } from './auth';

// Each file gets its own isolated token store so demo state doesn't bleed.
const tokenStore = createTokenStore('expired-token');
export const { getAccessToken, storeAccessToken, reset: resetToken } = tokenStore;

export const api = axios.create({ baseURL: 'https://api.example.com' });

// ── Mock adapter ──────────────────────────────────────────────────────────────
// All /data* requests return 401 (simulating an expired token).
// POST /auth/refresh-token returns a new token after a 300ms delay.

const mock = new MockAdapter(api, { delayResponse: 0 });

mock.onPost('/auth/refresh-token').reply(
  () =>
    new Promise((resolve) =>
      setTimeout(() => resolve([200, { accessToken: 'new-access-token' }]), 300),
    ),
);

// All /data* requests: respond 401 if the token is expired, 200 after refresh.
mock.onGet(/\/data\d+/).reply((config) => {
  const auth = config.headers?.['Authorization'] as string | undefined;
  if (!auth || auth === 'Bearer expired-token') {
    return [401, { message: 'Token expired' }];
  }
  // Request has the new token — simulate success.
  const path = config.url ?? '/data?';
  return [200, { message: `OK from ${path}`, timestamp: Date.now() }];
});

// ── Request interceptor (already implemented) ─────────────────────────────────
// Attaches the current access token as a Bearer header on every outgoing request.
api.interceptors.request.use((config) => {
  config.headers['Authorization'] = `Bearer ${getAccessToken()}`;
  return config;
});

// ❌ TODO: implement the response interceptor
// Your interceptor must:
//   1. Detect 401 responses (err.response?.status === 401)
//   2. Prevent duplicate refreshes using an `isRefreshing` flag
//   3. Queue waiting requests in `failedQueue` while a refresh is in progress
//   4. On refresh success: call processQueue(null, newToken), retry original request
//   5. On refresh failure: call processQueue(error, null), reject all queued
//   6. Use `originalRequest._retry = true` to prevent infinite retry loops
//
// Key data structures:
//   let isRefreshing = false
//   let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = []
//   const processQueue = (error: unknown, token: string | null): void => { ... }

api.interceptors.response.use(
  (res) => res,
  async (err: unknown) => {
    // ❌ TODO: your implementation here
    return Promise.reject(err);
  },
);
