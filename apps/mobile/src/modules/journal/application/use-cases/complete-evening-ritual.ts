import type { Child, ChildRepository } from '@/modules/auth';
import { withIncrementedStreak } from '@/modules/auth';
import type { EmotionId } from '@/modules/journal/domain/entities/emotion';
import type { JournalEntry } from '@/modules/journal/domain/entities/journal-entry';
import type { Clock } from '@/shared/domain/ports/clock';
import type { IdGenerator } from '@/shared/domain/ports/id-generator';
import type { JournalEntryRepository } from '@/modules/journal/domain/ports/journal-entry-repository';

export interface CompleteEveningRitualInput {
  readonly childId: string;
  readonly emotionId: EmotionId;
  readonly prideText: string;
  readonly photoUri: string | null;
}

export interface CompleteEveningRitualResult {
  readonly entry: JournalEntry;
  readonly child: Child;
}

export class CompleteEveningRitual {
  constructor(
    private readonly children: ChildRepository,
    private readonly journal: JournalEntryRepository,
    private readonly idGenerator: IdGenerator,
    private readonly clock: Clock,
  ) {}

  async execute(input: CompleteEveningRitualInput): Promise<CompleteEveningRitualResult> {
    const child = await this.children.findById(input.childId);
    if (!child) {
      throw new Error(`Enfant introuvable : ${input.childId}`);
    }

    const entry: JournalEntry = {
      id: this.idGenerator.next(),
      childId: child.id,
      emotionId: input.emotionId,
      prideText: input.prideText.trim(),
      photoUri: input.photoUri,
      createdAt: this.clock.now(),
    };
    await this.journal.save(entry);

    const rewardedChild = withIncrementedStreak(child);
    await this.children.save(rewardedChild);

    return { entry, child: rewardedChild };
  }
}
