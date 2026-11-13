import { z } from 'zod';

/** The child's memory of the evening: not blank, 500 characters at most. */
const text = z.string().trim().min(1).max(500);
/** Code of an emotion of the catalog (`GET /journal/emotions`). */
const emotionCode = z.string().min(1).max(20);
/** The family's local day, `YYYY-MM-DD`: the client knows it, the API doesn't. */
const localDate = z.iso.date();

/** The photo types the database takes (`photo_mime_type_allowed`). */
const photoMimeType = z.enum(['image/jpeg', 'image/png', 'image/webp']);

/**
 * The entry's photo as the API knows it: the picture stays on the device
 * (ADR-0004). Only the file name is kept, never a path — an absolute iOS or
 * Android path changes between installs, a `file://` URI or a Windows path
 * is a path too — so a slash or a backslash is refused.
 */
const photoInput = z.object({
  fileName: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[^/\\]+$/, { error: 'A file name, not a path: no slash nor backslash' }),
  mimeType: photoMimeType,
});

export const createEntryBody = z.object({
  childId: z.uuid(),
  emotionCode,
  text,
  date: localDate,
  photo: photoInput.optional(),
});

export type CreateEntryInput = z.infer<typeof createEntryBody>;

/**
 * Only the text, the emotion and the photo change; the date and the child
 * never do, so sending them is refused rather than silently ignored. A photo
 * adds or replaces the entry's one, `null` removes it.
 */
export const updateEntryBody = z
  .strictObject({
    emotionCode: emotionCode.optional(),
    text: text.optional(),
    photo: photoInput.nullable().optional(),
  })
  .refine((body) => Object.values(body).some((value) => value !== undefined), {
    error: 'At least one field must be provided',
  });

export type UpdateEntryInput = z.infer<typeof updateEntryBody>;

export const entryParams = z.object({ id: z.uuid() });

export const entriesQuery = z.object({ childId: z.uuid() });

export const streakQuery = z.object({ childId: z.uuid(), today: localDate });

/**
 * A journal entry as the API returns it: the emotion by code, the photo's
 * file name and type (or `null`), no internal id.
 */
export const entryResponse = z.object({
  id: z.uuid(),
  childId: z.uuid(),
  emotionCode: z.string(),
  text: z.string(),
  date: z.string(),
  createdAt: z.iso.datetime(),
  photo: z.object({ fileName: z.string(), mimeType: photoMimeType }).nullable(),
});

export type EntryResponse = z.infer<typeof entryResponse>;

/** Consecutive evenings with an entry, up to `today` or, failing that, the day before. */
export const streakResponse = z.object({ streak: z.number().int().nonnegative() });

export type StreakResponse = z.infer<typeof streakResponse>;
