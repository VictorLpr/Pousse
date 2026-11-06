import type { EmotionId } from '@/modules/journal/domain/entities/emotion';
import type { JournalEntry } from '@/modules/journal/domain/entities/journal-entry';
import type { JournalEntryRepository } from '@/modules/journal/domain/ports/journal-entry-repository';

export interface CompleteEveningRitualInput {
  readonly childId: string;
  readonly emotionId: EmotionId;
  readonly prideText: string;
  readonly photoUri: string | null;
}

/** Keeps tonight's memory; the streak follows from the journal (`GetEveningStreak`). */
export class CompleteEveningRitual {
  constructor(private readonly journal: JournalEntryRepository) {}

  execute(input: CompleteEveningRitualInput): Promise<JournalEntry> {
    return this.journal.create({
      childId: input.childId,
      emotionId: input.emotionId,
      prideText: input.prideText.trim(),
      photoUri: input.photoUri,
    });
  }
}
