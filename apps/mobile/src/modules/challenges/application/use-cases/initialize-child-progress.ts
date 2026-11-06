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
  ) {}

  async execute(childId: string): Promise<void> {
    await this.challenges.create({
      childId,
      title: STARTER_CHALLENGE_TITLE,
      completedTogether: false,
    });

    for (let slot = 0; slot < LOCKED_TROPHY_SLOTS; slot += 1) {
      await this.trophies.create({
        childId,
        name: 'À venir',
        status: 'locked',
      });
    }
  }
}
