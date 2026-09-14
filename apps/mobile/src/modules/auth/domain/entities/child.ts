export type AgeRange = '4-6' | '7-9' | '10-12';

export const AGE_RANGES: readonly AgeRange[] = ['4-6', '7-9', '10-12'];

export interface EveningReminder {
  /** Heure au format "HH:mm". */
  readonly time: string;
  readonly enabled: boolean;
}

export interface Child {
  readonly id: string;
  readonly householdId: string;
  readonly firstName: string;
  readonly ageRange: AgeRange;
  readonly reminder: EveningReminder;
  /** Nombre de soirs consécutifs où le rituel a été complété. */
  readonly streakInEvenings: number;
}

export const EVENINGS_PER_TROPHY = 7;

export function withIncrementedStreak(child: Child): Child {
  return { ...child, streakInEvenings: child.streakInEvenings + 1 };
}

export function withReminderEnabled(child: Child, enabled: boolean): Child {
  return { ...child, reminder: { ...child.reminder, enabled } };
}

export function eveningsUntilNextTrophy(child: Child): number {
  return EVENINGS_PER_TROPHY - (child.streakInEvenings % EVENINGS_PER_TROPHY);
}
