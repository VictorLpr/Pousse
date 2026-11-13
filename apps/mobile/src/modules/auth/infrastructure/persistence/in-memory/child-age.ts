import type { AgeRange } from '@/modules/auth/domain/entities/child';

const CALENDAR_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** `YYYY-MM-DD` naming a day that exists (no February 31), as the API's `z.iso.date()`. */
export function isCalendarDate(value: string): boolean {
  if (!CALENDAR_DATE_PATTERN.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/** Day of `now` in UTC, `YYYY-MM-DD`, as the API computes "today". */
export function utcDay(now: Date): string {
  return now.toISOString().slice(0, 10);
}

/**
 * Age in whole years on `today`, both dates as `YYYY-MM-DD`. Someone born on
 * February 29 turns a year older on March 1 in non-leap years. Same rule as
 * `ageOn` in the API's child service.
 */
export function ageOn(birthDate: string, today: string): number {
  const years = Number(today.slice(0, 4)) - Number(birthDate.slice(0, 4));
  return today.slice(5) < birthDate.slice(5) ? years - 1 : years;
}

/** A child past twelve stays in the older range rather than having none. */
export function ageRangeOf(age: number): AgeRange {
  return age < 8 ? '4-7' : '8-12';
}
