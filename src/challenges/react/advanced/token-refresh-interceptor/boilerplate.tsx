'use client';

/**
 * 🚧 BOILERPLATE
 *
 * The axios instance in `mock-api-boilerplate.ts` has a request interceptor
 * that attaches the Bearer token — but NO response interceptor. When 5 requests
 * hit 401 simultaneously, they all fail immediately. No retry, no token refresh.
 *
 * Your task: implement the response interceptor in mock-api-boilerplate.ts so that:
 *  1. The FIRST 401 triggers a POST /auth/refresh-token
 *  2. Every subsequent 401 (while refreshing) is QUEUED — not retried independently
 *  3. When the refresh completes, all queued requests are retried with the new token
 *  4. If the refresh fails, all queued requests are rejected
 *
 * Hints:
 *  - You need three module-level variables: `isRefreshing`, `failedQueue`, `processQueue`
 *  - `failedQueue` stores { resolve, reject } pairs — not the requests themselves
 *  - `originalRequest._retry = true` prevents the retried request from looping back here
 *  - Extend InternalAxiosRequestConfig (type intersection) to add the `_retry` field
 */

import { useCallback, useState } from 'react';
import { api, getAccessToken, resetToken } from './mock-api-boilerplate';

// ─── Inline UI primitives (Tailwind only) ─────────────────────────────────────

const Badge = ({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'warn' | 'ok' | 'info';
}) => {
  const colors: Record<string, string> = {
    default: 'bg-muted text-muted-foreground border-border',
    warn: 'bg-red-500/20 text-red-400 border-red-600',
    ok: 'bg-green-500/20 text-green-400 border-green-600',
    info: 'bg-blue-500/20 text-blue-400 border-blue-600',
  };
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-mono ${colors[variant] ?? colors['default']}`}
    >
      {children}
    </span>
  );
};

const Button = ({
  onClick,
  disabled,
  children,
  variant = 'default',
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: 'default' | 'destructive';
}) => {
  const base =
    'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variants: Record<string, string> = {
    default: 'border-border bg-card hover:bg-muted',
    destructive: 'border-red-800 bg-red-950/40 text-red-400 hover:bg-red-950/60',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant] ?? variants['default']}`}
    >
      {children}
    </button>
  );
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stats {
  total: number;
  succeeded: number;
  failed: number;
  refreshCount: number;
  queued: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TokenRefreshInterceptorBoilerplate(): React.JSX.Element {
  const [logs, setLogs] = useState<string[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    succeeded: 0,
    failed: 0,
    refreshCount: 0,
    queued: 0,
  });
  const [tokenState, setTokenState] = useState<'expired' | 'fresh'>('expired');
  const [isRunning, setIsRunning] = useState(false);

  const addLog = useCallback((msg: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 80));
  }, []);

  const handleFireRequests = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    setStats({ total: 5, succeeded: 0, failed: 0, refreshCount: 0, queued: 0 });
    setLogs([]);

    const endpoints = ['/data1', '/data2', '/data3', '/data4', '/data5'];

    endpoints.forEach((ep) => addLog(`🚀 ${ep} fired`));

    const results = await Promise.allSettled(endpoints.map((ep) => api.get(ep)));

    let succeeded = 0;
    let failed = 0;

    results.forEach((result, i) => {
      const ep = endpoints[i] ?? `endpoint-${i}`;
      if (result.status === 'fulfilled') {
        succeeded++;
        addLog(`✅ ${ep} → 200 success`);
      } else {
        failed++;
        const err = result.reason as { response?: { status?: number } };
        const status = err.response?.status ?? 'network error';
        addLog(`🔴 ${ep} → ${status} — no retry happened`);
      }
    });

    // Check token state after requests
    const currentToken = getAccessToken();
    setTokenState(currentToken === 'expired-token' ? 'expired' : 'fresh');

    setStats({ total: 5, succeeded, failed, refreshCount: 0, queued: 0 });
    setIsRunning(false);
  }, [isRunning, addLog]);

  const handleReset = useCallback(() => {
    resetToken();
    setTokenState('expired');
    setStats({ total: 0, succeeded: 0, failed: 0, refreshCount: 0, queued: 0 });
    setLogs([]);
    setIsRunning(false);
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold">Token Refresh Interceptor</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Fire 5 parallel requests with an expired token. Watch them all fail — no refresh happens.
        </p>
      </div>

      {/* Token state display */}
      <div className="rounded-md border border-border bg-card p-3 flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground font-medium">Current access token</p>
          <code className="text-xs font-mono text-foreground">{getAccessToken()}</code>
        </div>
        <Badge variant={tokenState === 'expired' ? 'warn' : 'ok'}>
          {tokenState === 'expired' ? '🔴 expired' : '🟢 fresh'}
        </Badge>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <Button onClick={handleFireRequests} disabled={isRunning}>
          {isRunning ? 'Firing…' : '🚀 Fire 5 Requests'}
        </Button>
        <Button onClick={handleReset} variant="destructive" disabled={isRunning}>
          ↺ Reset
        </Button>
      </div>

      {/* Event log */}
      <div className="rounded-md border bg-muted/30 p-3 font-mono text-xs max-h-48 overflow-y-auto space-y-1">
        {logs.length === 0 ? (
          <p className="text-muted-foreground">No events yet… click &quot;Fire 5 Requests&quot;.</p>
        ) : (
          logs.map((log, i) => <p key={i}>{log}</p>)
        )}
      </div>

      {/* Status badge strip */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={tokenState === 'expired' ? 'warn' : 'ok'}>
          Token: {tokenState === 'expired' ? '🔴 expired' : '🟢 fresh'}
        </Badge>
        <Badge variant={stats.refreshCount > 0 ? 'ok' : 'default'}>
          🔄 Refresh calls: {stats.refreshCount}
        </Badge>
        <Badge variant="info">⏳ Queued: {stats.queued}</Badge>
        <Badge variant={stats.failed > 0 ? 'warn' : stats.succeeded > 0 ? 'ok' : 'default'}>
          ✅ {stats.succeeded}/{stats.total} succeeded
        </Badge>
        <Badge variant={stats.failed > 0 ? 'warn' : 'default'}>
          🔴 {stats.failed} failed
        </Badge>
      </div>
    </div>
  );
}
