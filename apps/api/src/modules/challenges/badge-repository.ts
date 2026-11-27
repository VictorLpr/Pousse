import { and, asc, eq, inArray } from 'drizzle-orm';

import type { DbExecutor } from '#/shared/db/client.js';
import { badge, badgeAward } from '#/shared/db/schema.js';

/** A catalog badge with when the child earned it, `null` while it hasn't. */
export interface BadgeRow {
  readonly code: string;
  readonly label: string;
  readonly description: string | null;
  readonly awardedAt: Date | null;
}

/**
 * Data access for the `badge` catalog and `badge_award`. It never reads
 * `child`: whether a child belongs to the parent is the auth module's
 * service to answer (ADR-0006).
 */
export function createBadgeRepository(db: DbExecutor) {
  return {
    /** The whole catalog, in catalog order, with the child's awards. */
    listForChild(childId: string): Promise<BadgeRow[]> {
      return db
        .select({
          code: badge.code,
          label: badge.label,
          description: badge.description,
          awardedAt: badgeAward.awardedAt,
        })
        .from(badge)
        .leftJoin(
          badgeAward,
          and(eq(badgeAward.badgeId, badge.id), eq(badgeAward.childId, childId)),
        )
        .orderBy(asc(badge.id));
    },

    /**
     * Awards the badges of these codes the child doesn't hold yet and returns
     * only those, in catalog order. A badge already held is skipped by the
     * composite key (no identity column on `badge_award`, so a skipped row
     * draws nothing), which also settles two calls racing for the same badge.
     */
    async award(childId: string, codes: readonly string[]): Promise<BadgeRow[]> {
      if (codes.length === 0) return [];
      const catalog = await db
        .select({
          id: badge.id,
          code: badge.code,
          label: badge.label,
          description: badge.description,
        })
        .from(badge)
        .where(inArray(badge.code, [...codes]))
        .orderBy(asc(badge.id));
      if (catalog.length === 0) return [];
      const inserted = await db
        .insert(badgeAward)
        .values(catalog.map(({ id }) => ({ childId, badgeId: id })))
        .onConflictDoNothing({ target: [badgeAward.childId, badgeAward.badgeId] })
        .returning({ badgeId: badgeAward.badgeId, awardedAt: badgeAward.awardedAt });
      const awardedAt = new Map(inserted.map((row) => [row.badgeId, row.awardedAt]));
      return catalog.flatMap(({ id, ...row }) => {
        const at = awardedAt.get(id);
        return at === undefined ? [] : [{ ...row, awardedAt: at }];
      });
    },
  };
}

export type BadgeRepository = ReturnType<typeof createBadgeRepository>;
