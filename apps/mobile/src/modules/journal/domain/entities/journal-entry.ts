import type { EmotionId } from './emotion';

export interface JournalEntry {
  readonly id: string;
  readonly childId: string;
  readonly emotionId: EmotionId;
  readonly prideText: string;
  readonly photoUri: string | null;
  /** The family's local day the memory belongs to (YYYY-MM-DD); one entry per child per day. */
  readonly date: string;
  readonly createdAt: Date;
}

/** The local calendar day of `date`, formatted YYYY-MM-DD like the API's `date` column. */
export function localDayOf(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
