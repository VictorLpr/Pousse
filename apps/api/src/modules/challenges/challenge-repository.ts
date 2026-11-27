import { and, asc, eq, inArray, lt } from 'drizzle-orm';

import type { DbExecutor } from '#/shared/db/client.js';
import { challenge, childChallenge } from '#/shared/db/schema.js';

type CatalogAgeRange = (typeof challenge.$inferSelect)['ageRange'];
type StoredStatus = (typeof childChallenge.$inferSelect)['status'];

/** A catalog entry the draw can pick. */
export interface DrawableChallenge {
  readonly id: number;
  readonly code: string;
}

/** A challenge offered to a child, with its catalog entry. */
export interface ChildChallengeRow {
  readonly id: string;
  readonly childId: string;
  readonly weekStart: string;
  readonly status: StoredStatus;
  readonly chosenAt: Date | null;
  readonly completedAt: Date | null;
  readonly challenge: {
    readonly code: string;
    readonly title: string;
    readonly description: string;
    readonly category: (typeof challenge.$inferSelect)['category'];
    readonly ageRange: CatalogAgeRange;
  };
}

const childChallengeColumns = {
  id: childChallenge.id,
  childId: childChallenge.childId,
  weekStart: childChallenge.weekStart,
  status: childChallenge.status,
  chosenAt: childChallenge.chosenAt,
  completedAt: childChallenge.completedAt,
  challenge: {
    code: challenge.code,
    title: challenge.title,
    description: challenge.description,
    category: challenge.category,
    ageRange: challenge.ageRange,
  },
};

/**
 * Data access for `child_challenge` and the `challenge` catalog it draws
 * from. It never reads `child`: whether a child belongs to the parent, and
 * its age range, are the auth module's service to answer (ADR-0006).
 */
export function createChallengeRepository(db: DbExecutor) {
  function selectChildChallenges() {
    return db
      .select(childChallengeColumns)
      .from(childChallenge)
      .innerJoin(challenge, eq(childChallenge.challengeId, challenge.id));
  }

  return {
    /** Active catalog challenges of the given age ranges. */
    listDrawable(ageRanges: readonly CatalogAgeRange[]): Promise<DrawableChallenge[]> {
      return db
        .select({ id: challenge.id, code: challenge.code })
        .from(challenge)
        .where(and(eq(challenge.active, true), inArray(challenge.ageRange, [...ageRanges])));
    },

    /** A child's challenges of one week, in catalog order. */
    listWeek(childId: string, weekStart: string): Promise<ChildChallengeRow[]> {
      return selectChildChallenges()
        .where(and(eq(childChallenge.childId, childId), eq(childChallenge.weekStart, weekStart)))
        .orderBy(asc(challenge.id));
    },

    /** Catalog ids of the challenges a child was offered on one week. */
    async listWeekChallengeIds(childId: string, weekStart: string): Promise<number[]> {
      const rows = await db
        .select({ challengeId: childChallenge.challengeId })
        .from(childChallenge)
        .where(and(eq(childChallenge.childId, childId), eq(childChallenge.weekStart, weekStart)));
      return rows.map(({ challengeId }) => challengeId);
    },

    /**
     * Offers the challenges to the child for the week. A challenge already
     * offered that week is skipped rather than refused, so two draws racing
     * on the same week leave one set of rows (the draw is deterministic).
     */
    async offer(
      childId: string,
      weekStart: string,
      challengeIds: readonly number[],
    ): Promise<void> {
      if (challengeIds.length === 0) return;
      await db
        .insert(childChallenge)
        .values(challengeIds.map((challengeId) => ({ childId, challengeId, weekStart })))
        .onConflictDoNothing({
          target: [childChallenge.childId, childChallenge.challengeId, childChallenge.weekStart],
        });
    },

    /** Expires the child's challenges of earlier weeks that were neither completed nor already expired. */
    async expireBefore(childId: string, weekStart: string): Promise<void> {
      await db
        .update(childChallenge)
        .set({ status: 'expired' })
        .where(
          and(
            eq(childChallenge.childId, childId),
            lt(childChallenge.weekStart, weekStart),
            inArray(childChallenge.status, ['proposed', 'chosen']),
          ),
        );
    },

    async findById(id: string): Promise<ChildChallengeRow | undefined> {
      const [row] = await selectChildChallenges().where(eq(childChallenge.id, id));
      return row;
    },

    /**
     * Takes the challenge on, if it is still `proposed`. Throws the database's
     * unique violation when another challenge of the week is already taken;
     * the update runs in its own transaction (a savepoint when `db` already
     * is one), so the violation doesn't abort the caller's transaction.
     * False when the challenge was no longer `proposed`.
     */
    choose(id: string, chosenAt: Date): Promise<boolean> {
      return db.transaction(async (tx) => {
        const rows = await tx
          .update(childChallenge)
          .set({ status: 'chosen', chosenAt })
          .where(and(eq(childChallenge.id, id), eq(childChallenge.status, 'proposed')))
          .returning({ id: childChallenge.id });
        return rows.length > 0;
      });
    },

    /** Categories of the challenges a child has completed, each once. */
    async listCompletedCategories(
      childId: string,
    ): Promise<ChildChallengeRow['challenge']['category'][]> {
      const rows = await db
        .selectDistinct({ category: challenge.category })
        .from(childChallenge)
        .innerJoin(challenge, eq(childChallenge.challengeId, challenge.id))
        .where(and(eq(childChallenge.childId, childId), eq(childChallenge.status, 'completed')));
      return rows.map(({ category }) => category);
    },

    /** Completes the challenge, if it is `chosen`. False when it wasn't. */
    async complete(id: string, completedAt: Date): Promise<boolean> {
      const rows = await db
        .update(childChallenge)
        .set({ status: 'completed', completedAt })
        .where(and(eq(childChallenge.id, id), eq(childChallenge.status, 'chosen')))
        .returning({ id: childChallenge.id });
      return rows.length > 0;
    },
  };
}

export type ChallengeRepository = ReturnType<typeof createChallengeRepository>;
