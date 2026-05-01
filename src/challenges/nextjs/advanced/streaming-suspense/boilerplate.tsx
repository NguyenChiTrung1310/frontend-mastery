'use client';

/**
 * 🚧 BOILERPLATE
 *
 * Notice how nothing renders for ~2 seconds because we await all three fetches
 * up front. Refactor to use `<Suspense>` so the profile shows immediately while
 * orders and recommendations stream in.
 */

import { useEffect, useState } from 'react';
import {
  fetchOrders,
  fetchProfile,
  fetchRecommendations,
  type Order,
  type Product,
  type UserProfile,
} from './mock-api';

export default function StreamingBoilerplate(): React.JSX.Element {
  const [data, setData] = useState<{
    profile: UserProfile;
    orders: Order[];
    recs: Product[];
  } | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [startedAt] = useState(() => Date.now());

  const addLog = (msg: string): void => {
    const elapsed = ((Date.now() - startedAt) / 1000).toFixed(2);
    setLogs((prev) => [`[+${elapsed}s] ${msg}`, ...prev].slice(0, 50));
  };

  useEffect(() => {
    let cancelled = false;
    addLog('⏳ All three fetches started simultaneously');

    const t0 = Date.now();
    void (async () => {
      // ❌ Anti-pattern: even with Promise.all, nothing renders until the SLOWEST resolves.
      // The fix is *streaming* via <Suspense> boundaries, not parallel-awaiting.
      const [profile, orders, recs] = await Promise.all([
        fetchProfile(),
        fetchOrders(),
        fetchRecommendations(),
      ]);
      const elapsed = ((Date.now() - t0) / 1000).toFixed(2);
      if (!cancelled) {
        addLog(`✅ ALL sections resolved after ${elapsed}s — entire page unblocked at once`);
        setData({ profile, orders, recs });
      }
    })();
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      {/* ⚠️ Nothing renders here until ALL three fetches complete */}
      {!data ? (
        <p className="text-sm text-muted-foreground animate-pulse">
          ⏳ Loading entire dashboard… (blocked on slowest fetch)
        </p>
      ) : (
        <>
          <Section title="Profile">
            <p className="text-sm">{data.profile.name}</p>
            <p className="text-xs text-muted-foreground">{data.profile.email}</p>
          </Section>
          <Section title="Recent Orders">
            <ul className="text-sm">
              {data.orders.map((o) => (
                <li key={o.id}>
                  {o.id} — ${o.total.toFixed(2)}
                </li>
              ))}
            </ul>
          </Section>
          <Section title="Recommendations">
            <ul className="text-sm">
              {data.recs.map((p) => (
                <li key={p.id}>{p.name}</li>
              ))}
            </ul>
          </Section>
        </>
      )}

      {/* Timeline log — makes the "all-or-nothing" block jarring */}
      <div className="rounded-md border bg-muted/30 p-3 font-mono text-xs max-h-48 overflow-y-auto space-y-1">
        {logs.length === 0
          ? <p className="text-muted-foreground">Loading timeline will appear here…</p>
          : logs.map((log, i) => <p key={i}>{log}</p>)
        }
      </div>
      <p className="text-xs text-muted-foreground">
        ⚠️ Notice the log shows a single unlock after ~2s — all sections appear at once.
        Fix this with <code className="rounded bg-muted px-1">{'<Suspense>'}</code> so each section streams in independently.
      </p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="rounded-md border p-4">
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      {children}
    </div>
  );
}
