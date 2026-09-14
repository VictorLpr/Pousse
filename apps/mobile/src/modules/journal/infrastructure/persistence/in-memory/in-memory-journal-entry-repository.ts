import type { JournalEntry } from '@/modules/journal/domain/entities/journal-entry';
import type { JournalEntryRepository } from '@/modules/journal/domain/ports/journal-entry-repository';

export class InMemoryJournalEntryRepository implements JournalEntryRepository {
  private readonly entriesById = new Map<string, JournalEntry>();

  constructor(seed: readonly JournalEntry[] = []) {
    seed.forEach((entry) => this.entriesById.set(entry.id, entry));
  }

  async findByChildId(childId: string): Promise<JournalEntry[]> {
    return [...this.entriesById.values()]
      .filter((entry) => entry.childId === childId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async save(entry: JournalEntry): Promise<void> {
    this.entriesById.set(entry.id, entry);
  }
}
