const DAY_MS = 86_400_000;

/** `day` moved by whole days, both `YYYY-MM-DD`. */
export function addDays(day: string, days: number): string {
  return new Date(Date.parse(`${day}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

/** Whole days from `from` to `to`, both `YYYY-MM-DD` (negative when `to` is earlier). */
export function daysBetween(from: string, to: string): number {
  return (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS;
}

/** Monday of the ISO week `day` falls in, both `YYYY-MM-DD`. */
export function mondayOf(day: string): string {
  // getUTCDay(): 0 is Sunday, which closes the ISO week.
  const weekday = new Date(`${day}T00:00:00Z`).getUTCDay();
  return addDays(day, -((weekday + 6) % 7));
}
