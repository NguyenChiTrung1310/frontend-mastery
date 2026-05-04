'use client';

/**
 * ✅ SOLUTION — Token Refresh Interceptor with queue
 *
 * The response interceptor in mock-api-solution.ts implements the full
 * isRefreshing + failedQueue + processQueue pattern:
 *
 *  1. FIRST 401: sets isRefreshing = true, fires POST /auth/refresh-token.
 *     All subsequent 401s while isRefreshing is true push to failedQueue
 *     instead of triggering another refresh.
 *
 *  2. On success: processQueue(null, newToken) resolves all queued promises
 *     with the new token. Each queued resolver re-attaches the Authorization
 *     header and retries its original request.
 *
 *  3. On failure: processQueue(refreshError, null) rejects all queued promises
 *     so each caller surfaces a real error rather than hanging forever.
 *
 *  4. originalRequest._retry = true prevents infinite loops: if the retried
 *     request returns 401 again (e.g. new token is also invalid), the
 *     interceptor short-circuits and rejects instead of re-queuing.
 *
 * Result: N parallel 401s trigger exactly 1 refresh. The thundering herd
 * is tamed at the HTTP layer — no React state involved.
 */

import { useCallback, useRef, useState } from 'react';
import { api, getAccessToken, resetDemoState } from './mock-api-solution';

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

export default function TokenRefreshInterceptorSolution(): React.JSX.Element {
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

  // Accumulate log lines synchronously during the run, then flush to state.
  // Using a ref avoids stale-closure issues with addLog inside Promise callbacks.
  const logBufferRef = useRef<string[]>([]);

  const flushLogs = useCallback(() => {
    setLogs([...logBufferRef.current].reverse());
  }, []);

  const bufferLog = useCallback((msg: string) => {
    logBufferRef.current.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
    // Flush immediately so the UI updates as events arrive.
    setLogs([...logBufferRef.current].reverse().slice(0, 80));
  }, []);

  const handleFireRequests = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    logBufferRef.current = [];
    setStats({ total: 5, succeeded: 0, failed: 0, refreshCount: 0, queued: 0 });
    setLogs([]);

    const endpoints = ['/data1', '/data2', '/data3', '/data4', '/data5'];

    // Intercept axios to observe queue events for the log panel.
    // We hook into the response interceptor output by wrapping each request.
    let refreshFired = false;
    let queuedCount = 0;

    // Patch: add a one-shot request interceptor that logs 401 detection.
    // The actual queue logic lives in mock-api-solution.ts.
    const reqId = api.interceptors.request.use((config) => {
      // Already attached by mock-api-solution's interceptor — just observe.
      return config;
    });

    // Fire all 5 requests simultaneously.
    endpoints.forEach((ep) => bufferLog(`🚀 ${ep} fired`));

    // We need to observe the 401 -> refresh sequence from outside the interceptor.
    // Wrap each request and catch the intermediate 401-then-retry lifecycle
    // by hooking a response interceptor that runs BEFORE the queue interceptor.
    // Simpler approach: instrument via a shared observable ref.
    const observeId = api.interceptors.response.use(
      (res) => {
        // Detect retried requests (they carry _retry flag on their config).
        const cfg = res.config as { _retry?: boolean; url?: string };
        if (cfg._retry) {
          bufferLog(`✅ ${cfg.url ?? '?'} retried → 200 success`);
          flushLogs();
        }
        return res;
      },
      (err: unknown) => {
        // Observe the 401 before the queue interceptor handles it.
        if (
          typeof err === 'object' &&
          err !== null &&
          'response' in err &&
          'config' in err
        ) {
          const e = err as {
            response?: { status?: number };
            config: { url?: string; _retry?: boolean };
          };
          if (e.response?.status === 401 && !e.config._retry) {
            if (!refreshFired) {
              refreshFired = true;
              bufferLog(
                `🔴 ${e.config.url ?? '?'} → 401 — triggering refresh (isRefreshing = false)`,
              );
              bufferLog('🔄 Refreshing token…');
            } else {
              queuedCount++;
              bufferLog(
                `⏳ ${e.config.url ?? '?'} → 401 — queued (isRefreshing = true, queue size: ${queuedCount})`,
              );
            }
          }
        }
        return Promise.reject(err);
      },
    );

    const results = await Promise.allSettled(endpoints.map((ep) => api.get(ep)));

    // Remove our observation interceptors.
    api.interceptors.response.eject(observeId);
    api.interceptors.request.eject(reqId);

    // Detect token refresh by checking if the token changed.
    const currentToken = getAccessToken();
    const didRefresh = currentToken !== 'expired-token';

    if (didRefresh) {
      bufferLog(`✅ Token refreshed — new token: ${currentToken}`);
    }

    let succeeded = 0;
    let failed = 0;

    results.forEach((result, i) => {
      const ep = endpoints[i] ?? `endpoint-${i}`;
      if (result.status === 'fulfilled') {
        succeeded++;
        // Only log non-retry successes (retries logged by observeId above).
        const cfg = result.value.config as { _retry?: boolean };
        if (!cfg._retry) {
          bufferLog(`✅ ${ep} → 200 success (first attempt)`);
        }
      } else {
        failed++;
        const err = result.reason as { response?: { status?: number } };
        const status = err.response?.status ?? 'network error';
        bufferLog(`🔴 ${ep} → ${status} failed permanently`);
      }
    });

    setTokenState(didRefresh ? 'fresh' : 'expired');
    setStats({
      total: 5,
      succeeded,
      failed,
      refreshCount: didRefresh ? 1 : 0,
      queued: queuedCount,
    });
    flushLogs();
    setIsRunning(false);
  }, [isRunning, bufferLog, flushLogs]);

  const handleReset = useCallback(() => {
    resetDemoState();
    setTokenState('expired');
    setStats({ total: 0, succeeded: 0, failed: 0, refreshCount: 0, queued: 0 });
    setLogs([]);
    logBufferRef.current = [];
    setIsRunning(false);
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold">Token Refresh Interceptor</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          5 parallel 401s → exactly 1 refresh → all 5 retry and succeed.
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

      {/* Event log — shows the queue mechanics in real time */}
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
        <Badge variant={stats.refreshCount === 1 ? 'ok' : 'default'}>
          🔄 Refresh calls: {stats.refreshCount}
        </Badge>
        <Badge variant={stats.queued > 0 ? 'info' : 'default'}>
          ⏳ Queued: {stats.queued}
        </Badge>
        <Badge variant={stats.failed > 0 ? 'warn' : stats.succeeded > 0 ? 'ok' : 'default'}>
          ✅ {stats.succeeded}/{stats.total} succeeded
        </Badge>
        <Badge variant={stats.failed > 0 ? 'warn' : 'default'}>
          🔴 {stats.failed} failed
        </Badge>
      </div>

      {/* Explanation card */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <p className="font-semibold text-sm">✅ Why This Works</p>
        <ul className="space-y-1.5 text-xs text-muted-foreground list-none">
          <li>
            <span className="text-foreground font-medium">isRefreshing flag gates the refresh</span>{' '}
            — only the FIRST 401 triggers it; all others push their{' '}
            <code className="rounded bg-muted px-1">{'{ resolve, reject }'}</code> into{' '}
            <code className="rounded bg-muted px-1">failedQueue</code> instead of firing another
            POST /auth/refresh-token.
          </li>
          <li>
            <span className="text-foreground font-medium">failedQueue stores callbacks, not requests</span>{' '}
            — when <code className="rounded bg-muted px-1">processQueue(null, newToken)</code> fires,
            each callback re-attaches the Authorization header and retries its own original request
            via <code className="rounded bg-muted px-1">api(originalRequest)</code>.
          </li>
          <li>
            <span className="text-foreground font-medium">
              originalRequest._retry prevents infinite loops
            </span>{' '}
            — if the retry itself returns 401 (e.g. the new token is also invalid), the interceptor
            short-circuits and rejects rather than re-queuing forever.
          </li>
        </ul>

        {/* Before/after code panel */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-md border border-red-800 bg-red-950/40 p-3">
            <p className="text-xs font-semibold text-red-400 mb-2">❌ Before</p>
            <pre className="text-xs text-red-200 whitespace-pre-wrap">{`api.interceptors.response.use(
  res => res,
  async (err) => {
    // all 401s fail immediately
    return Promise.reject(err);
  }
);`}</pre>
          </div>
          <div className="rounded-md border border-green-800 bg-green-950/40 p-3">
            <p className="text-xs font-semibold text-green-400 mb-2">✅ After</p>
            <pre className="text-xs text-green-200 whitespace-pre-wrap">{`if (isRefreshing) {
  // queue instead of refresh
  return new Promise((res, rej) => {
    failedQueue.push({ res, rej });
  });
}
isRefreshing = true;
const token = await refresh();
processQueue(null, token);`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
