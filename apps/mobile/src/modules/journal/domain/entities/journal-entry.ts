import type { EmotionCode } from './emotion';
import type { EntryPhoto } from './photo';

/** The longest memory a child can write, as the API allows it. */
export const JOURNAL_TEXT_MAX_LENGTH = 500;

/** A journal entry shaped like the API's response (`/journal/entries`). */
export interface JournalEntry {
  readonly id: string;
  readonly childId: string;
  readonly emotionCode: EmotionCode;
  readonly text: string;
  /** The family's local day the memory belongs to (YYYY-MM-DD); one entry per child per day. */
  readonly date: string;
  /** When the entry was kept: the start of its 24-hour edit window. */
  readonly createdAt: Date;
  readonly photo: EntryPhoto | null;
}

/** What the client sends to keep an entry: the backend adds the id and `createdAt`. */
export type NewJournalEntry = Omit<JournalEntry, 'id' | 'createdAt'>;

/**
 * A badge the entry earned. Badges belong to the challenges module, which
 * the journal's domain can't import: this is the same shape, as the API's
 * `awardedBadges` carries it.
 */
export interface AwardedBadge {
  readonly code: string;
  readonly label: string;
  readonly description: string | null;
  readonly awardedAt: Date;
}

/** The kept entry with the badges it earned, as `POST /journal/entries` returns it. */
export interface CreatedJournalEntry extends JournalEntry {
  /** Only the badges this entry earned, in catalog order; empty when none. */
  readonly awardedBadges: readonly AwardedBadge[];
}

/** The local calendar day of `date`, formatted YYYY-MM-DD like the API's `date` column. */
export function localDayOf(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
