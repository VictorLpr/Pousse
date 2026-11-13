import type { JournalEntry, NewJournalEntry } from '../entities/journal-entry';

export interface JournalEntryRepository {
  /** Returns a child's memories, newest first. */
  findByChildId(childId: string): Promise<JournalEntry[]>;
  /**
   * Keeps the entry on the day the client gives (`POST /journal/entries`).
   * Throws `JournalError`: `ENTRY_ALREADY_EXISTS` if the child already has an
   * entry that day, `DATE_OUT_OF_RANGE` for a day more than one day away from
   * the UTC date, `UNKNOWN_EMOTION`, `CHILD_NOT_FOUND`, `VALIDATION_FAILED`.
   */
  create(entry: NewJournalEntry): Promise<JournalEntry>;
  /**
   * Consecutive evenings with an entry, counted back from `today` (the
   * family's local day, YYYY-MM-DD) or from the day before while tonight's
   * ritual is still to do; 0 once an evening is missed.
   */
  countEveningStreak(childId: string, today: string): Promise<number>;
}
