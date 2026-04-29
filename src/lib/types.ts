export type ChallengeCategory = 'javascript' | 'typescript' | 'react' | 'nextjs' | 'dsa';
export type ChallengeDifficulty = 'basic' | 'intermediate' | 'advanced';

export interface ChallengeMeta {
  /** URL-safe identifier — corresponds to the folder name. */
  slug: string;
  title: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  /** Short one-liner shown in the sidebar / cards. */
  description: string;
  /** Optional tags for filtering (e.g. ['hooks', 'concurrent']). */
  tags?: readonly string[];
  /** Estimated time to complete, in minutes. */
  estimatedMinutes?: number;
}

export interface ChallengePath {
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  slug: string;
}

/**
 * The shape of every challenge entry in the registry.
 * `loaders` are async dynamic imports — Next.js code-splits them per route.
 */
export interface ChallengeEntry extends ChallengeMeta {
  readme: string;
  loaders: {
    boilerplate: () => Promise<{ default: React.ComponentType }>;
    solution: () => Promise<{ default: React.ComponentType }>;
  };
}
