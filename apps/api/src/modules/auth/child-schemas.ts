import { z } from 'zod';

/** Age ranges the challenges are drawn from, computed from the birth date. */
export const childAgeRange = z.enum(['4-7', '8-12']);

export type ChildAgeRange = z.infer<typeof childAgeRange>;

const firstName = z.string().trim().min(1).max(50);
/** Calendar date, `YYYY-MM-DD`. */
const birthDate = z.iso.date();
/** Code of a built-in avatar (ADR-0004: never an uploaded picture). */
const avatar = z
  .string()
  .min(1)
  .max(30)
  .regex(/^[a-z0-9-]+$/);
/** Evening reminder time, `HH:mm`. */
const reminderTime = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

/**
 * Parental consent given when the profile is created (GDPR, under 15): the
 * version of the privacy policy the parent accepted, and their attestation
 * of being the child's legal guardian, which can only be `true`.
 */
const consentInput = z.object({
  policyVersion: z.string().trim().min(1).max(10),
  guardianAttested: z.literal(true),
});

export const createChildBody = z.object({
  firstName,
  birthDate,
  avatar: avatar.optional(),
  reminderTime: reminderTime.optional(),
  reminderEnabled: z.boolean().optional(),
  consent: consentInput,
});

export type CreateChildInput = z.infer<typeof createChildBody>;

export const updateChildBody = z
  .object({
    firstName: firstName.optional(),
    birthDate: birthDate.optional(),
    /** `null` removes the avatar. */
    avatar: avatar.nullable().optional(),
    reminderTime: reminderTime.optional(),
    reminderEnabled: z.boolean().optional(),
  })
  .refine((body) => Object.values(body).some((value) => value !== undefined), {
    error: 'At least one field must be provided',
  });

export type UpdateChildInput = z.infer<typeof updateChildBody>;

export const childParams = z.object({ id: z.uuid() });

/** A child as the API returns it: no parent id, no technical timestamps. */
export const childResponse = z.object({
  id: z.uuid(),
  firstName: z.string(),
  birthDate: z.string(),
  ageRange: childAgeRange,
  avatar: z.string().nullable(),
  reminderTime: z.string(),
  reminderEnabled: z.boolean(),
});

export type ChildResponse = z.infer<typeof childResponse>;

/** Proof of the parental consent: when it was given, to which policy version. */
export const consentResponse = z.object({
  givenAt: z.iso.datetime(),
  policyVersion: z.string(),
});

export type ConsentResponse = z.infer<typeof consentResponse>;
