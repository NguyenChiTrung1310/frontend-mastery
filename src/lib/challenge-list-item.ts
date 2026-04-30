import type { ChallengeMeta } from '@/lib/types';

/**
 * Serializable subset of a ChallengeEntry passed from server to client.
 * Drops `readme` and `loaders` — neither survives the RSC boundary nor matters
 * for catalog browsing.
 */
export type ChallengeListItem = Pick<
  ChallengeMeta,
  'slug' | 'title' | 'category' | 'difficulty' | 'description' | 'tags' | 'estimatedMinutes'
>;

export function getChallengeHref(item: Pick<ChallengeListItem, 'category' | 'difficulty' | 'slug'>): string {
  return `/challenges/${item.category}/${item.difficulty}/${item.slug}`;
}
