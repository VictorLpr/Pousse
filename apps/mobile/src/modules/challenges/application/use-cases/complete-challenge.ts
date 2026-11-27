import type { ChildChallenge } from '@/modules/challenges/domain/entities/child-challenge';
import type { ChildChallengeRepository } from '@/modules/challenges/domain/ports/child-challenge-repository';

/** Marks the week's chosen challenge as done together. */
export class CompleteChallenge {
  constructor(private readonly challenges: ChildChallengeRepository) {}

  execute(childChallengeId: string): Promise<ChildChallenge> {
    return this.challenges.complete(childChallengeId);
  }
}
