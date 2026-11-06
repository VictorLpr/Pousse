import type { JournalEntry } from '@/modules/journal/domain/entities/journal-entry';
import type { JournalEntryRepository } from '@/modules/journal/domain/ports/journal-entry-repository';
import type { IdGenerator } from '@/shared/domain/ports/id-generator';
import type { Clock } from '@/shared/infrastructure/time/clock';

export class InMemoryJournalEntryRepository implements JournalEntryRepository {
  private readonly entriesById = new Map<string, JournalEntry>();

  constructor(
    seed: readonly JournalEntry[],
    private readonly idGenerator: IdGenerator,
    private readonly clock: Clock,
  ) {
    seed.forEach((entry) => this.entriesById.set(entry.id, entry));
  }

  async findByChildId(childId: string): Promise<JournalEntry[]> {
    return [...this.entriesById.values()]
      .filter((entry) => entry.childId === childId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async create(newEntry: Omit<JournalEntry, 'id' | 'createdAt'>): Promise<JournalEntry> {
    const entry: JournalEntry = {
      id: this.idGenerator.next(),
      ...newEntry,
      createdAt: this.clock.now(),
    };
    this.entriesById.set(entry.id, entry);
    return entry;
  }
}
