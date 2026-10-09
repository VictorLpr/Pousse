import type { IdGenerator } from '@/shared/domain/ports/id-generator';
import type { TrophyRepository } from '@/modules/challenges/domain/ports/trophy-repository';
import type { WeeklyChallengeRepository } from '@/modules/challenges/domain/ports/weekly-challenge-repository';

const STARTER_CHALLENGE_TITLE = "Fais un compliment à quelqu'un que tu aimes";
const LOCKED_TROPHY_SLOTS = 2;

/**
 * Sets up the challenges of a newly created child: their first weekly
 * challenge and their trophy slots.
 */
export class InitializeChildProgress {
  constructor(
    private readonly challenges: WeeklyChallengeRepository,
    private readonly trophies: TrophyRepository,
    private readonly idGenerator: IdGenerator,
  ) {}

  async execute(childId: string): Promise<void> {
    await this.challenges.save({
      id: this.idGenerator.next(),
      childId,
      title: STARTER_CHALLENGE_TITLE,
      completedTogether: false,
    });

    for (let slot = 0; slot < LOCKED_TROPHY_SLOTS; slot += 1) {
      await this.trophies.save({
        id: this.idGenerator.next(),
        childId,
        name: 'À venir',
        status: 'locked',
      });
    }
  }
}
