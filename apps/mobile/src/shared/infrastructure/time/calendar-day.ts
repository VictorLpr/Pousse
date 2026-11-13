/** Calendar days as `YYYY-MM-DD` strings, computed like the API does (in UTC). */

const CALENDAR_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86_400_000;

/** `YYYY-MM-DD` naming a day that exists (no February 31), as the API's `z.iso.date()`. */
export function isCalendarDate(value: string): boolean {
  if (!CALENDAR_DATE_PATTERN.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/** Day of `now` in UTC, as the API computes "today". */
export function utcDay(now: Date): string {
  return now.toISOString().slice(0, 10);
}

/** Whole days from `from` to `to`, negative when `to` comes first. */
export function daysBetween(from: string, to: string): number {
  return (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS;
}

/** The calendar day before `day`. */
export function previousDay(day: string): string {
  return new Date(Date.parse(`${day}T00:00:00Z`) - DAY_MS).toISOString().slice(0, 10);
}
