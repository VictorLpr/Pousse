import { type JournalEntry, localDayOf } from '@/modules/journal/domain/entities/journal-entry';
import { JournalError } from '@/modules/journal/domain/errors/journal-error';
import type { JournalEntryRepository } from '@/modules/journal/domain/ports/journal-entry-repository';
import type { IdGenerator } from '@/shared/infrastructure/ids/id-generator';
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

  async create(newEntry: Omit<JournalEntry, 'id' | 'date' | 'createdAt'>): Promise<JournalEntry> {
    const now = this.clock.now();
    const date = localDayOf(now);
    const alreadyExists = [...this.entriesById.values()].some(
      (entry) => entry.childId === newEntry.childId && entry.date === date,
    );
    if (alreadyExists) {
      throw new JournalError(
        'ENTRY_ALREADY_EXISTS',
        `Child ${newEntry.childId} already has a journal entry on ${date}`,
      );
    }

    const entry: JournalEntry = {
      ...newEntry,
      id: this.idGenerator.next(),
      date,
      createdAt: now,
    };
    this.entriesById.set(entry.id, entry);
    return entry;
  }

  async countEveningStreak(childId: string): Promise<number> {
    const daysWithEntry = new Set(
      [...this.entriesById.values()]
        .filter((entry) => entry.childId === childId)
        .map((entry) => entry.date),
    );

    const cursor = new Date(this.clock.now().getTime());
    if (!daysWithEntry.has(localDayOf(cursor))) {
      cursor.setDate(cursor.getDate() - 1);
    }

    let streak = 0;
    while (daysWithEntry.has(localDayOf(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }
}
