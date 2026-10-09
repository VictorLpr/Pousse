import type { WeeklyChallenge } from '@/modules/challenges/domain/entities/weekly-challenge';
import { withChallengeCompleted } from '@/modules/challenges/domain/entities/weekly-challenge';
import type { WeeklyChallengeRepository } from '@/modules/challenges/domain/ports/weekly-challenge-repository';

export class CompleteWeeklyChallenge {
  constructor(private readonly challenges: WeeklyChallengeRepository) {}

  async execute(childId: string): Promise<WeeklyChallenge> {
    const challenge = await this.challenges.findCurrentByChildId(childId);
    if (!challenge) {
      throw new Error(`No ongoing challenge for child: ${childId}`);
    }

    const completedChallenge = withChallengeCompleted(challenge);
    await this.challenges.save(completedChallenge);
    return completedChallenge;
  }
}
