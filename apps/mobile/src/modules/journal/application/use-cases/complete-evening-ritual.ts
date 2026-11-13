import type { EmotionCode } from '@/modules/journal/domain/entities/emotion';
import type { JournalEntry } from '@/modules/journal/domain/entities/journal-entry';
import type { EntryPhoto } from '@/modules/journal/domain/entities/photo';
import type { JournalEntryRepository } from '@/modules/journal/domain/ports/journal-entry-repository';

export interface CompleteEveningRitualInput {
  readonly childId: string;
  readonly emotionCode: EmotionCode;
  readonly text: string;
  /** The family's local day when the ritual began (YYYY-MM-DD), sent as is. */
  readonly date: string;
  /** The photo's file name and type only: the picture stays on the device (ADR-0004). */
  readonly photo: EntryPhoto | null;
}

/** Keeps tonight's memory; the streak follows from the journal (`GetEveningStreak`). */
export class CompleteEveningRitual {
  constructor(private readonly journal: JournalEntryRepository) {}

  execute(input: CompleteEveningRitualInput): Promise<JournalEntry> {
    return this.journal.create({
      childId: input.childId,
      emotionCode: input.emotionCode,
      text: input.text.trim(),
      date: input.date,
      photo: input.photo,
    });
  }
}
