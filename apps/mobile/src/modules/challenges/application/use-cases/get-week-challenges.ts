import type { WeekChallenges } from '@/modules/challenges/domain/entities/child-challenge';
import type { ChildChallengeRepository } from '@/modules/challenges/domain/ports/child-challenge-repository';

/** The week's three challenges; the backend draws them on the week's first call. */
export class GetWeekChallenges {
  constructor(private readonly challenges: ChildChallengeRepository) {}

  /** `today` is the family's local day (YYYY-MM-DD): the backend doesn't know it. */
  execute(childId: string, today: string): Promise<WeekChallenges> {
    return this.challenges.findWeek(childId, today);
  }
}
