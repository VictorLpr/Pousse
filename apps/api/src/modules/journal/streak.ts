/** The calendar day before `day`, both `YYYY-MM-DD`. */
export function previousDay(day: string): string {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

/** Whole days from `from` to `to`, both `YYYY-MM-DD` (negative when `to` is earlier). */
export function daysBetween(from: string, to: string): number {
  return (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000;
}

/**
 * Consecutive evenings with an entry, counted back from `today`, or from the
 * day before while tonight's ritual is still to do; 0 once an evening is
 * missed. Same rule as the mobile client's fake backend.
 */
export function countEveningStreak(entryDates: Iterable<string>, today: string): number {
  const days = new Set(entryDates);
  let cursor = days.has(today) ? today : previousDay(today);
  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor = previousDay(cursor);
  }
  return streak;
}
