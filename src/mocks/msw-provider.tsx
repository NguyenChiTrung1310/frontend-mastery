'use client';

import { useEffect, useState, type ReactNode } from 'react';

interface MswProviderProps {
  children: ReactNode;
}

// Module-level singleton: React Strict Mode runs effects twice, but we must only
// call worker.start() once or MSW throws an Invariant Violation.
let workerPromise: Promise<void> | null = null;

function getWorkerPromise(): Promise<void> {
  if (!workerPromise) {
    workerPromise = import('@/mocks/browser').then(({ worker }) =>
      worker.start({ onUnhandledRequest: 'bypass', quiet: true }).then(() => undefined),
    );
  }
  return workerPromise;
}

/**
 * Boots up MSW in the browser before rendering children. We gate behind NODE_ENV
 * so the worker never ships in production bundles.
 *
 * The user must run `npx msw init public/ --save` once after `pnpm install` to
 * generate `public/mockServiceWorker.js` (a one-time setup step).
 */
export function MswProvider({ children }: MswProviderProps): React.JSX.Element | null {
  const [ready, setReady] = useState(process.env.NODE_ENV !== 'development');

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    let cancelled = false;
    void getWorkerPromise().then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
