import type { ChildChallenge } from '@/modules/challenges/domain/entities/child-challenge';
import type { ChildChallengeRepository } from '@/modules/challenges/domain/ports/child-challenge-repository';

/** Picks one of the week's proposals; the choice is final. */
export class ChooseChallenge {
  constructor(private readonly challenges: ChildChallengeRepository) {}

  execute(childChallengeId: string): Promise<ChildChallenge> {
    return this.challenges.choose(childChallengeId);
  }
}
