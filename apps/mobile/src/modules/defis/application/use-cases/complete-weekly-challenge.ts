import type { WeeklyChallenge } from '@/modules/defis/domain/entities/weekly-challenge';
import { withChallengeCompleted } from '@/modules/defis/domain/entities/weekly-challenge';
import type { WeeklyChallengeRepository } from '@/modules/defis/domain/ports/weekly-challenge-repository';

export class CompleteWeeklyChallenge {
  constructor(private readonly challenges: WeeklyChallengeRepository) {}

  async execute(childId: string): Promise<WeeklyChallenge> {
    const challenge = await this.challenges.findCurrentByChildId(childId);
    if (!challenge) {
      throw new Error(`Aucun défi en cours pour l'enfant : ${childId}`);
    }

    const completedChallenge = withChallengeCompleted(challenge);
    await this.challenges.save(completedChallenge);
    return completedChallenge;
  }
}
