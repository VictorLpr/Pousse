import type { CompletedChallenge } from '@/modules/challenges/domain/entities/child-challenge';
import type { ChildChallengeRepository } from '@/modules/challenges/domain/ports/child-challenge-repository';

/** Marks the week's chosen challenge as done together; the backend awards its badges. */
export class CompleteChallenge {
  constructor(private readonly challenges: ChildChallengeRepository) {}

  execute(childChallengeId: string): Promise<CompletedChallenge> {
    return this.challenges.complete(childChallengeId);
  }
}
