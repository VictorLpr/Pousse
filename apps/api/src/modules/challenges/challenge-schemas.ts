import { z } from 'zod';

import { ageRange, challengeCategory } from '#/shared/db/schema.js';

/** The family's local day, `YYYY-MM-DD`: the client knows it, the API doesn't. */
const localDate = z.iso.date();

export const weekQuery = z.object({ childId: z.uuid(), today: localDate });

export const childChallengeParams = z.object({ id: z.uuid() });

/**
 * The statuses a client can see. `abandoned` exists in the database but no
 * route leads to it: a choice is final.
 */
const childChallengeStatus = z.enum(['proposed', 'chosen', 'completed', 'expired']);

export type ChildChallengeStatus = z.infer<typeof childChallengeStatus>;

/** A challenge offered to a child, with its catalog entry by code (no internal id). */
export const childChallengeResponse = z.object({
  id: z.uuid(),
  status: childChallengeStatus,
  chosenAt: z.iso.datetime().nullable(),
  completedAt: z.iso.datetime().nullable(),
  challenge: z.object({
    code: z.string(),
    title: z.string(),
    description: z.string(),
    category: z.enum(challengeCategory.enumValues),
    ageRange: z.enum(ageRange.enumValues),
  }),
});

export type ChildChallengeResponse = z.infer<typeof childChallengeResponse>;

/** The challenges offered to a child for the ISO week starting on `weekStart` (a Monday). */
export const weekResponse = z.object({
  weekStart: z.string(),
  challenges: z.array(childChallengeResponse),
});

export type WeekResponse = z.infer<typeof weekResponse>;
