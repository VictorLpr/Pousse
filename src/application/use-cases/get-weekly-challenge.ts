import type { WeeklyChallenge } from '@/domain/entities/weekly-challenge';
import type { WeeklyChallengeRepository } from '@/domain/ports/weekly-challenge-repository';

export class GetWeeklyChallenge {
  constructor(private readonly challenges: WeeklyChallengeRepository) {}

  execute(childId: string): Promise<WeeklyChallenge | null> {
    return this.challenges.findCurrentByChildId(childId);
  }
}
