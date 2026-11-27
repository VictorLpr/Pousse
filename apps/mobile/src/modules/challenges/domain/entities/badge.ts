/**
 * A catalog badge with when the child earned it, as `GET /challenges/badges`
 * returns it: the whole catalog, so a badge with no `awardedAt` is one still
 * to earn.
 */
export interface Badge {
  /** Stable English key, e.g. `first_evening`. */
  readonly code: string;
  readonly label: string;
  readonly description: string | null;
  readonly awardedAt: Date | null;
}

/** A badge the child holds, as `awardedBadges` lists those an action just earned. */
export interface AwardedBadge extends Badge {
  readonly awardedAt: Date;
}

export function isAwarded(badge: Badge): badge is AwardedBadge {
  return badge.awardedAt !== null;
}

/** The shelf once `awarded` is earned: the catalog stays in its order. */
export function withBadgesAwarded(
  badges: readonly Badge[],
  awarded: readonly AwardedBadge[],
): Badge[] {
  return badges.map((badge) => awarded.find(({ code }) => code === badge.code) ?? badge);
}
