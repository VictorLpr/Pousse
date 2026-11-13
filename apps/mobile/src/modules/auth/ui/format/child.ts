import type { AgeRange, Child } from '@/modules/auth/domain/entities/child';

const AGE_RANGE_LABELS: Record<AgeRange, string> = {
  '4-7': '4–7',
  '8-12': '8–12',
};

/** E.g. "8–12 ans". */
export function ageRangeWithYears(ageRange: AgeRange): string {
  return `${AGE_RANGE_LABELS[ageRange]} ans`;
}

/**
 * `YYYY-MM-DD` from the day, month and year typed in the form, e.g. "7",
 * "3", "2018" → "2018-03-07". No check here: the backend rejects a day that
 * does not exist.
 */
export function birthDateFromParts(day: string, month: string, year: string): string {
  return `${year.trim()}-${month.trim().padStart(2, '0')}-${day.trim().padStart(2, '0')}`;
}

export function childInitial(firstName: string): string {
  return firstName.trim().charAt(0).toUpperCase() || '?';
}

/** E.g. "Tous les soirs · 20:00". */
export function reminderLabel(child: Child): string {
  return `Tous les soirs · ${child.reminder.time}`;
}
