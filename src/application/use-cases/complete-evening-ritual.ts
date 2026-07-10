import type { Child } from '@/domain/entities/child';
import { withIncrementedStreak } from '@/domain/entities/child';
import type { EmotionId } from '@/domain/entities/emotion';
import type { JournalEntry } from '@/domain/entities/journal-entry';
import type { ChildRepository } from '@/domain/ports/child-repository';
import type { Clock } from '@/domain/ports/clock';
import type { IdGenerator } from '@/domain/ports/id-generator';
import type { JournalEntryRepository } from '@/domain/ports/journal-entry-repository';

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
