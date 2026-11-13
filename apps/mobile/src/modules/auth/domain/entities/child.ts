export type AgeRange = '4-6' | '7-9' | '10-12';

export const AGE_RANGES: readonly AgeRange[] = ['4-6', '7-9', '10-12'];

export interface EveningReminder {
  /** Time in "HH:mm" format. */
  readonly time: string;
  readonly enabled: boolean;
}

export interface Child {
  readonly id: string;
  readonly parentId: string;
  readonly firstName: string;
  readonly ageRange: AgeRange;
  readonly reminder: EveningReminder;
}

export function withReminderEnabled(child: Child, enabled: boolean): Child {
  return { ...child, reminder: { ...child.reminder, enabled } };
}
