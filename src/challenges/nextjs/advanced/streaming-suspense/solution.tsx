'use client';

/**
 * ✅ SOLUTION
 *
 * In a real Next.js App Router page these would be Server Components that just
 * `await` directly. Since this sandbox runs in the browser, we use React 18's
 * `use()` hook (which also unwraps promises in Suspense-compatible ways) plus
 * cached promises so the components don't re-trigger on every render.
 *
 * The mental model is identical to RSC streaming: each Suspense boundary unblocks
 * the rest of the tree.
 */

import { Suspense, use, useMemo } from 'react';
import {
  fetchOrders,
  fetchProfile,
  fetchRecommendations,
  type Order,
  type Product,
  type UserProfile,
} from './mock-api';

export default function StreamingSolution(): React.JSX.Element {
  // Cache promises so Suspense can re-throw them without restarting fetches.
  const profilePromise = useMemo(() => fetchProfile(), []);
  const ordersPromise = useMemo(() => fetchOrders(), []);
  const recsPromise = useMemo(() => fetchRecommendations(), []);

  return (
    <div className="space-y-4">
      <Suspense fallback={<Skeleton title="Profile" />}>
        <ProfileSection promise={profilePromise} />
      </Suspense>
      <Suspense fallback={<Skeleton title="Recent Orders" />}>
        <OrdersSection promise={ordersPromise} />
      </Suspense>
      <Suspense fallback={<Skeleton title="Recommendations" />}>
        <RecsSection promise={recsPromise} />
      </Suspense>

      <div className="rounded-md border border-border bg-card p-4 space-y-3">
        <p className="text-sm font-semibold">✅ Why This Works</p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>Each <code className="rounded bg-muted px-1">{'<Suspense>'}</code> boundary is independent — when one section resolves, it reveals immediately without waiting for the others.</li>
          <li>Promises are created with <code className="rounded bg-muted px-1">useMemo</code> so Suspense can re-throw the same promise on re-render without restarting the fetch.</li>
          <li>The mental model mirrors RSC streaming: <code className="rounded bg-muted px-1">use(promise)</code> in a Server Component suspends that subtree while the rest of the page renders.</li>
        </ul>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-md border border-red-800 bg-red-950/40 p-3">
            <p className="text-xs font-semibold text-red-400 mb-2">❌ Before</p>
            <pre className="text-xs text-red-200 whitespace-pre-wrap">{`// Blocks entire page until slowest resolves
const [profile, orders, recs] =
  await Promise.all([...]);
// Nothing shows for ~2 seconds`}</pre>
          </div>
          <div className="rounded-md border border-green-800 bg-green-950/40 p-3">
            <p className="text-xs font-semibold text-green-400 mb-2">✅ After</p>
            <pre className="text-xs text-green-200 whitespace-pre-wrap">{`<Suspense fallback={<Skeleton />}>
  <ProfileSection promise={profilePromise} />
</Suspense>
// Each section streams in independently`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileSection({ promise }: { promise: Promise<UserProfile> }): React.JSX.Element {
  const profile = use(promise);
  return (
    <Section title="Profile">
      <p className="text-sm">{profile.name}</p>
      <p className="text-xs text-muted-foreground">{profile.email}</p>
    </Section>
  );
}

function OrdersSection({ promise }: { promise: Promise<Order[]> }): React.JSX.Element {
  const orders = use(promise);
  return (
    <Section title="Recent Orders">
      <ul className="text-sm">
        {orders.map((o) => (
          <li key={o.id}>
            {o.id} — ${o.total.toFixed(2)}
          </li>
        ))}
      </ul>
    </Section>
  );
}

function RecsSection({ promise }: { promise: Promise<Product[]> }): React.JSX.Element {
  const recs = use(promise);
  return (
    <Section title="Recommendations">
      <ul className="text-sm">
        {recs.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
    </Section>
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

function Skeleton({ title }: { title: string }): React.JSX.Element {
  return (
    <div className="rounded-md border p-4">
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      <div className="space-y-2">
        <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
