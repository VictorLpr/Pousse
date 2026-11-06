import type { AgeRange, Child } from '@/modules/auth/domain/entities/child';

const AGE_RANGE_LABELS: Record<AgeRange, string> = {
  '4-6': '4–6',
  '7-9': '7–9',
  '10-12': '10–12',
};

export function ageRangeLabel(ageRange: AgeRange): string {
  return AGE_RANGE_LABELS[ageRange];
}

export function ageRangeWithYears(ageRange: AgeRange): string {
  return `${AGE_RANGE_LABELS[ageRange]} ans`;
}

export function childInitial(firstName: string): string {
  return firstName.trim().charAt(0).toUpperCase() || '?';
}

/** E.g. "Tous les soirs · 20:00". */
export function reminderLabel(child: Child): string {
  return `Tous les soirs · ${child.reminder.time}`;
}
