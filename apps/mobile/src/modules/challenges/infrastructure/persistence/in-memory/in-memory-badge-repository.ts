import type { AwardedBadge, Badge } from '@/modules/challenges/domain/entities/badge';
import type { ChallengeCategory } from '@/modules/challenges/domain/entities/challenge';
import { ChallengeError } from '@/modules/challenges/domain/errors/challenge-error';
import type { BadgeRepository } from '@/modules/challenges/domain/ports/badge-repository';
import type { Clock } from '@/shared/infrastructure/time/clock';

/** A `badge` catalog row. */
export type CatalogBadge = Omit<Badge, 'awardedAt'>;

/** A `badge_award` row: each badge is awarded once per child. */
export interface StoredBadgeAward {
  readonly childId: string;
  readonly code: string;
  readonly awardedAt: Date;
}

/** What the journal knows once an evening's entry is written. */
export interface EveningFacts {
  /** Consecutive evenings with an entry, up to the new entry's day. */
  readonly streak: number;
}

/** What the challenges know once a challenge is completed. */
export interface ChallengeFacts {
  /** Categories of every challenge the child has completed, the new one included. */
  readonly completedCategories: ReadonlySet<ChallengeCategory>;
}

/** The API's conditions (`apps/api/src/modules/challenges/badge-service.ts`), by code. */
const EVENING_CONDITIONS: Readonly<Record<string, (facts: EveningFacts) => boolean>> = {
  first_evening: ({ streak }) => streak >= 1,
  three_evenings: ({ streak }) => streak >= 3,
  seven_evenings: ({ streak }) => streak >= 7,
  thirty_evenings: ({ streak }) => streak >= 30,
};

const CHALLENGE_CONDITIONS: Readonly<Record<string, (facts: ChallengeFacts) => boolean>> = {
  first_challenge: ({ completedCategories }) => completedCategories.size > 0,
  helping_challenge: ({ completedCategories }) => completedCategories.has('helping'),
  creativity_challenge: ({ completedCategories }) => completedCategories.has('creativity'),
  learning_challenge: ({ completedCategories }) => completedCategories.has('learning'),
  politeness_challenge: ({ completedCategories }) => completedCategories.has('politeness'),
};

function metBy<Facts>(
  conditions: Readonly<Record<string, (facts: Facts) => boolean>>,
  facts: Facts,
): Set<string> {
  return new Set(
    Object.entries(conditions)
      .filter(([, isMet]) => isMet(facts))
      .map(([code]) => code),
  );
}

/**
 * Fake badges API (`GET /challenges/badges`) and the awarding the API does
 * after `POST /journal/entries` and `POST /challenges/:id/complete`: same
 * conditions, each badge awarded once per child when its condition is first
 * met, no backfill of past history. The award methods sit outside the port:
 * on the API, the server awards badges, never the client.
 */
export class InMemoryBadgeRepository implements BadgeRepository {
  /** Award dates by child, then by badge code. */
  private readonly awards = new Map<string, Map<string, Date>>();

  constructor(
    private readonly catalog: readonly CatalogBadge[],
    seed: readonly StoredBadgeAward[],
    /** Whether the child exists: the API asks the auth module (ADR-0006). */
    private readonly childExists: (childId: string) => Promise<boolean>,
    private readonly clock: Clock,
  ) {
    seed.forEach(({ childId, code, awardedAt }) => this.awardsOf(childId).set(code, awardedAt));
  }

  async findByChildId(childId: string): Promise<Badge[]> {
    if (!(await this.childExists(childId))) {
      throw new ChallengeError('CHILD_NOT_FOUND', `Child not found: ${childId}`);
    }
    const awards = this.awardsOf(childId);
    return this.catalog.map((badge) => ({ ...badge, awardedAt: awards.get(badge.code) ?? null }));
  }

  /** Awards the evening badges now met; returns only those earned by this call. */
  awardForEvening(childId: string, facts: EveningFacts): AwardedBadge[] {
    return this.award(childId, metBy(EVENING_CONDITIONS, facts));
  }

  /** Awards the challenge badges now met; returns only those earned by this call. */
  awardForChallenges(childId: string, facts: ChallengeFacts): AwardedBadge[] {
    return this.award(childId, metBy(CHALLENGE_CONDITIONS, facts));
  }

  /** Awards the badges of these codes the child doesn't hold yet, in catalog order. */
  private award(childId: string, codes: ReadonlySet<string>): AwardedBadge[] {
    const awards = this.awardsOf(childId);
    const awardedAt = this.clock.now();
    return this.catalog
      .filter((badge) => codes.has(badge.code) && !awards.has(badge.code))
      .map((badge) => {
        awards.set(badge.code, awardedAt);
        return { ...badge, awardedAt };
      });
  }

  private awardsOf(childId: string): Map<string, Date> {
    let awards = this.awards.get(childId);
    if (!awards) {
      awards = new Map();
      this.awards.set(childId, awards);
    }
    return awards;
  }
}
