// Solution axios instance — full queue-based token refresh interceptor.

import axios, { type InternalAxiosRequestConfig } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { createTokenStore } from './auth';

// Isolated token store — does not share state with mock-api-boilerplate.ts.
const tokenStore = createTokenStore('expired-token');
export const { getAccessToken, storeAccessToken, reset: resetToken } = tokenStore;

export const api = axios.create({ baseURL: 'https://api.example.com' });

// ── Mock adapter (identical to boilerplate) ───────────────────────────────────

const mock = new MockAdapter(api, { delayResponse: 0 });

mock.onPost('/auth/refresh-token').reply(
  () =>
    new Promise((resolve) =>
      setTimeout(() => resolve([200, { accessToken: 'new-access-token' }]), 300),
    ),
);

mock.onGet(/\/data\d+/).reply((config) => {
  const auth = config.headers?.['Authorization'] as string | undefined;
  if (!auth || auth === 'Bearer expired-token') {
    return [401, { message: 'Token expired' }];
  }
  const path = config.url ?? '/data?';
  return [200, { message: `OK from ${path}`, timestamp: Date.now() }];
});

// ── Request interceptor ───────────────────────────────────────────────────────

api.interceptors.request.use((config) => {
  config.headers['Authorization'] = `Bearer ${getAccessToken()}`;
  return config;
});

// ── Queue state (module-level — survives re-renders, reset by resetToken) ─────

// True while a refresh POST is in flight.
let isRefreshing = false;

// Each entry is a pair of callbacks for a request that hit 401 while isRefreshing.
// When the refresh resolves, processQueue calls the right one.
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

// Drain the queue, either resolving all with the new token or rejecting all.
const processQueue = (error: unknown, token: string | null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      // token is non-null when error is null — the ! is safe here.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Extend InternalAxiosRequestConfig to carry the _retry sentinel.
// Using `unknown` intersection to avoid casting to `any`.
type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// ── Response interceptor — the full queue implementation ──────────────────────

api.interceptors.response.use(
  (res) => res,
  async (err: unknown) => {
    // err is typed unknown — narrow it to access axios-specific fields.
    if (
      typeof err !== 'object' ||
      err === null ||
      !('response' in err) ||
      !('config' in err)
    ) {
      return Promise.reject(err);
    }

    const axiosErr = err as {
      response?: { status?: number };
      config: RetryableConfig;
    };

    const originalRequest = axiosErr.config;
    const status = axiosErr.response?.status;

    // Only intercept the first 401 on each request.
    // _retry prevents infinite loops if the retry itself returns 401.
    if (status !== 401 || originalRequest._retry) {
      return Promise.reject(err);
    }

    if (isRefreshing) {
      // A refresh is already in flight — queue this request instead of
      // firing a second refresh. Return a Promise that resolves when
      // processQueue() drains the queue with the new token.
      return new Promise<unknown>((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    // This is the FIRST 401 — claim the refresh slot.
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await api.post<{ accessToken: string }>('/auth/refresh-token');
      // Store the new token so future requests (and retries) use it.
      storeAccessToken(data.accessToken);
      // Drain the queue — all queued requests get the new token.
      processQueue(null, data.accessToken);
      // Retry the original request with the new token.
      originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      // Refresh failed (e.g. refresh token expired) — reject everything in the queue.
      processQueue(refreshError, null);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

// Expose a reset so the UI "Reset" button can restore the expired-token state
// and clear the queue for a fresh demo run.
export function resetDemoState() {
  resetToken();
  isRefreshing = false;
  failedQueue = [];
}
