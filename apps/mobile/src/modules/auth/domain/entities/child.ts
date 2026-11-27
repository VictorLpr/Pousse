/** Age range the challenges are drawn from, computed by the backend from the birth date. */
export type AgeRange = '4-7' | '8-12';

/** A profile can only be created for a child of 4 to 12 years old. */
export const MIN_CHILD_AGE = 4;
export const MAX_CHILD_AGE = 12;

export interface EveningReminder {
  /** Time in "HH:mm" format. */
  readonly time: string;
  readonly enabled: boolean;
}

/**
 * A child of the signed-in parent, as the API returns it: no parent id, the
 * backend scopes every read to the session.
 */
export interface Child {
  readonly id: string;
  readonly firstName: string;
  /** Calendar date, `YYYY-MM-DD`. */
  readonly birthDate: string;
  /** Read only: the backend computes it from `birthDate` on every read. */
  readonly ageRange: AgeRange;
  /** Code of a built-in avatar, never an uploaded picture (ADR-0004). */
  readonly avatar: string | null;
  readonly reminder: EveningReminder;
}

/**
 * What creating a profile sends: the backend adds the id and the age range.
 * `parentId` is for the fake backend; the API takes the session's parent.
 */
export type NewChild = Omit<Child, 'id' | 'ageRange'> & { readonly parentId: string };

export function withReminderEnabled(child: Child, enabled: boolean): Child {
  return { ...child, reminder: { ...child.reminder, enabled } };
}
