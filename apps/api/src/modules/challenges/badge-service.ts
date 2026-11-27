import type { ChildService } from '#/modules/auth/index.js';
import { createBadgeRepository, type BadgeRow } from '#/modules/challenges/badge-repository.js';
import type { BadgeResponse } from '#/modules/challenges/badge-schemas.js';
import type { Db } from '#/shared/db/client.js';
import type { challengeCategory } from '#/shared/db/schema.js';

type ChallengeCategory = (typeof challengeCategory.enumValues)[number];

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

/**
 * The condition of each catalog badge (`shared/db/catalogs/badges.ts`),
 * indexed by code and split by the event that can earn it.
 */
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

/** Codes of every badge that has a condition, for the catalog to be checked against. */
export const BADGE_CONDITION_CODES: readonly string[] = [
  ...Object.keys(EVENING_CONDITIONS),
  ...Object.keys(CHALLENGE_CONDITIONS),
];

function metBy<Facts>(
  conditions: Readonly<Record<string, (facts: Facts) => boolean>>,
  facts: Facts,
): string[] {
  return Object.entries(conditions)
    .filter(([, isMet]) => isMet(facts))
    .map(([code]) => code);
}

function toResponse(row: BadgeRow): BadgeResponse {
  return {
    code: row.code,
    label: row.label,
    description: row.description,
    awardedAt: row.awardedAt?.toISOString() ?? null,
  };
}

/**
 * Badges: a catalog, and each one awarded once per child (the composite key
 * of `badge_award`) when its condition is first met.
 *
 * The facts a condition needs are handed in by the service that knows them:
 * the journal's entry service passes the evening's streak, the challenge
 * service the categories completed. This service never calls the journal, so
 * the modules don't depend on each other both ways (ADR-0006). Whether a
 * child belongs to the parent is asked to the auth module's service.
 */
export function createBadgeService(db: Db, { children }: { readonly children: ChildService }) {
  const badges = createBadgeRepository(db);

  return {
    /** The whole catalog, with when the child earned each badge (`null` if not yet). */
    async list(parentId: string, childId: string): Promise<BadgeResponse[]> {
      await children.get(parentId, childId);
      return (await badges.listForChild(childId)).map(toResponse);
    },

    /** Awards the evening badges now met; returns only those earned by this call. */
    async awardForEvening(childId: string, facts: EveningFacts): Promise<BadgeResponse[]> {
      return (await badges.award(childId, metBy(EVENING_CONDITIONS, facts))).map(toResponse);
    },

    /** Awards the challenge badges now met; returns only those earned by this call. */
    async awardForChallenges(childId: string, facts: ChallengeFacts): Promise<BadgeResponse[]> {
      return (await badges.award(childId, metBy(CHALLENGE_CONDITIONS, facts))).map(toResponse);
    },
  };
}

export type BadgeService = ReturnType<typeof createBadgeService>;
