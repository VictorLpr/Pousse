import { z } from 'zod';

/** The child's memory of the evening: not blank, 500 characters at most. */
const text = z.string().trim().min(1).max(500);
/** Code of an emotion of the catalog (`GET /journal/emotions`). */
const emotionCode = z.string().min(1).max(20);
/** The family's local day, `YYYY-MM-DD`: the client knows it, the API doesn't. */
const localDate = z.iso.date();

export const createEntryBody = z.object({
  childId: z.uuid(),
  emotionCode,
  text,
  date: localDate,
});

export type CreateEntryInput = z.infer<typeof createEntryBody>;

/**
 * Only the text and the emotion change; the date and the child never do, so
 * sending them is refused rather than silently ignored.
 */
export const updateEntryBody = z
  .strictObject({
    emotionCode: emotionCode.optional(),
    text: text.optional(),
  })
  .refine((body) => Object.values(body).some((value) => value !== undefined), {
    error: 'At least one field must be provided',
  });

export type UpdateEntryInput = z.infer<typeof updateEntryBody>;

export const entryParams = z.object({ id: z.uuid() });

export const entriesQuery = z.object({ childId: z.uuid() });

export const streakQuery = z.object({ childId: z.uuid(), today: localDate });

/** A journal entry as the API returns it: the emotion by code, no internal id. */
export const entryResponse = z.object({
  id: z.uuid(),
  childId: z.uuid(),
  emotionCode: z.string(),
  text: z.string(),
  date: z.string(),
  createdAt: z.iso.datetime(),
});

export type EntryResponse = z.infer<typeof entryResponse>;

/** Consecutive evenings with an entry, up to `today` or, failing that, the day before. */
export const streakResponse = z.object({ streak: z.number().int().nonnegative() });

export type StreakResponse = z.infer<typeof streakResponse>;
