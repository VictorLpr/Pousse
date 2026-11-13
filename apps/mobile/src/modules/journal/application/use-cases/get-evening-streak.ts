import type { JournalEntryRepository } from '@/modules/journal/domain/ports/journal-entry-repository';

/** The child's current streak of evenings, computed from the journal by the backend. */
export class GetEveningStreak {
  constructor(private readonly journal: JournalEntryRepository) {}

  /** `today` is the family's local day (YYYY-MM-DD): the backend doesn't know it. */
  execute(childId: string, today: string): Promise<number> {
    return this.journal.countEveningStreak(childId, today);
  }
}
