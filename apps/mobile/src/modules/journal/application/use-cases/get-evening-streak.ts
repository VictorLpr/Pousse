import type { JournalEntryRepository } from '@/modules/journal/domain/ports/journal-entry-repository';

/** The child's current streak of evenings, computed from the journal like the API does. */
export class GetEveningStreak {
  constructor(private readonly journal: JournalEntryRepository) {}

  execute(childId: string): Promise<number> {
    return this.journal.countEveningStreak(childId);
  }
}
