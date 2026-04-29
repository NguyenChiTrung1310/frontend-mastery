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

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      // ❌ Anti-pattern: awaits sequentially-ish for clarity, but even Promise.all
      // would still block on the slowest. The fix is *streaming*, not parallel-awaiting.
      const [profile, orders, recs] = await Promise.all([
        fetchProfile(),
        fetchOrders(),
        fetchRecommendations(),
      ]);
      if (!cancelled) setData({ profile, orders, recs });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data) {
    return <p className="text-sm text-muted-foreground">Loading entire dashboard…</p>;
  }

  return (
    <div className="space-y-4">
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
