import { z } from 'zod';

export const badgesQuery = z.object({ childId: z.uuid() });

/**
 * A catalog badge, by code (no internal id), with when the child earned it:
 * `null` while it is still to earn.
 */
export const badgeResponse = z.object({
  code: z.string(),
  label: z.string(),
  description: z.string().nullable(),
  awardedAt: z.iso.datetime().nullable(),
});

export type BadgeResponse = z.infer<typeof badgeResponse>;

/** The badges a call earned the child, in catalog order; empty when it earned none. */
export const awardedBadges = z.array(badgeResponse);
