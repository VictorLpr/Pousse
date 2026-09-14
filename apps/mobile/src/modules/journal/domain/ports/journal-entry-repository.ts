import type { JournalEntry } from '../entities/journal-entry';

export interface JournalEntryRepository {
  /** Retourne les souvenirs d'un enfant, du plus récent au plus ancien. */
  findByChildId(childId: string): Promise<JournalEntry[]>;
  save(entry: JournalEntry): Promise<void>;
}
