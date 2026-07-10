import type { WeeklyChallenge } from '@/domain/entities/weekly-challenge';
import type { WeeklyChallengeRepository } from '@/domain/ports/weekly-challenge-repository';

export class InMemoryWeeklyChallengeRepository implements WeeklyChallengeRepository {
  private readonly challengesById = new Map<string, WeeklyChallenge>();

  constructor(seed: readonly WeeklyChallenge[] = []) {
    seed.forEach((challenge) => this.challengesById.set(challenge.id, challenge));
  }

  async findCurrentByChildId(childId: string): Promise<WeeklyChallenge | null> {
    const challenge = [...this.challengesById.values()].find(
      (candidate) => candidate.childId === childId,
    );
    return challenge ?? null;
  }

  async save(challenge: WeeklyChallenge): Promise<void> {
    this.challengesById.set(challenge.id, challenge);
  }
}
