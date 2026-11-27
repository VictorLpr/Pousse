import type { ChallengeCategory } from '@/modules/challenges/domain/entities/challenge';

const CHALLENGE_CATEGORY_LABELS: Record<ChallengeCategory, string> = {
  helping: 'Coup de main',
  creativity: 'Créativité',
  learning: 'Découverte',
  politeness: 'Politesse',
};

/** The category's display name, as the challenge cards show it. */
export function challengeCategoryLabel(category: ChallengeCategory): string {
  return CHALLENGE_CATEGORY_LABELS[category];
}
