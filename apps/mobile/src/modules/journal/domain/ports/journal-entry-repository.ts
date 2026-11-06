import type { JournalEntry } from '../entities/journal-entry';

export interface JournalEntryRepository {
  /** Returns a child's memories, newest first. */
  findByChildId(childId: string): Promise<JournalEntry[]>;
  /** Throws `JournalError` `ENTRY_ALREADY_EXISTS` if the child already has an entry today. */
  create(entry: Omit<JournalEntry, 'id' | 'date' | 'createdAt'>): Promise<JournalEntry>;
  /**
   * Consecutive evenings with an entry, counted back from today (or from
   * yesterday while tonight's ritual is still to do); 0 once an evening is missed.
   */
  countEveningStreak(childId: string): Promise<number>;
}
