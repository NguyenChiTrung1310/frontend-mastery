import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';

import { findChallenge, getAllChallengePaths } from '@/registry/challenges';
import type { ChallengeCategory, ChallengeDifficulty } from '@/lib/types';
import { ChallengeWorkspace } from '@/components/challenge/challenge-workspace';

interface PageProps {
  params: { slug: string[] };
}

/**
 * Pre-render every known challenge at build time. This makes navigation feel instantaneous
 * and acts as a cheap correctness check — any broken import/path surfaces in `next build`.
 */
export function generateStaticParams(): Array<{ slug: string[] }> {
  return getAllChallengePaths().map(({ category, difficulty, slug }) => ({
    slug: [category, difficulty, slug],
  }));
}

export function generateMetadata({ params }: PageProps): { title: string } {
  const [category, difficulty, slug] = params.slug;
  if (!category || !difficulty || !slug) return { title: 'Challenge — Frontend Mastery' };

  const entry = findChallenge({
    category: category as ChallengeCategory,
    difficulty: difficulty as ChallengeDifficulty,
    slug,
  });
  return { title: entry ? `${entry.title} — Frontend Mastery` : 'Challenge — Frontend Mastery' };
}

export default function ChallengePage({ params }: PageProps): React.JSX.Element {
  const [category, difficulty, slug, ...rest] = params.slug;

  // Strict catch-all guards — the route must be exactly /challenges/<category>/<difficulty>/<slug>
  if (!category || !difficulty || !slug || rest.length > 0) {
    notFound();
  }

  const entry = findChallenge({
    category: category as ChallengeCategory,
    difficulty: difficulty as ChallengeDifficulty,
    slug,
  });

  if (!entry) {
    notFound();
  }

  /**
   * `next/dynamic` here is critical:
   *  - It produces a per-challenge JS chunk so we don't ship every challenge in one bundle.
   *  - `ssr: false` is intentional — boilerplates often use browser-only APIs (timers, etc).
   *  - `loading` gives users feedback while the chunk fetches.
   */
  const Boilerplate = dynamic(entry.loaders.boilerplate, {
    ssr: false,
    loading: () => <PreviewSkeleton label="Loading boilerplate…" />,
  });
  const Solution = dynamic(entry.loaders.solution, {
    ssr: false,
    loading: () => <PreviewSkeleton label="Loading solution…" />,
  });

  // JS / DSA challenges use the console heavily — surface the panel for them.
  const showConsole = entry.category === 'javascript' || entry.category === 'dsa';

  return (
    <ChallengeWorkspace
      meta={entry}
      readme={entry.readme}
      Boilerplate={Boilerplate}
      Solution={Solution}
      showConsole={showConsole}
    />
  );
}

function PreviewSkeleton({ label }: { label: string }): React.JSX.Element {
  return (
    <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}
