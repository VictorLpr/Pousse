import type { JournalEntry } from '@/modules/journal/domain/entities/journal-entry';
import type { JournalEntryRepository } from '@/modules/journal/domain/ports/journal-entry-repository';

export class GetJournalEntries {
  constructor(private readonly journal: JournalEntryRepository) {}

  execute(childId: string): Promise<JournalEntry[]> {
    return this.journal.findByChildId(childId);
  }
}
