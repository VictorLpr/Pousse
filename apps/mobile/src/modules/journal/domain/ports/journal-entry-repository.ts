import type { JournalEntry } from '../entities/journal-entry';

export interface JournalEntryRepository {
  /** Returns a child's memories, newest first. */
  findByChildId(childId: string): Promise<JournalEntry[]>;
  save(entry: JournalEntry): Promise<void>;
}
