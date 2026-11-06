import type { WeeklyChallenge } from '@/modules/challenges/domain/entities/weekly-challenge';
import type { WeeklyChallengeRepository } from '@/modules/challenges/domain/ports/weekly-challenge-repository';
import type { IdGenerator } from '@/shared/infrastructure/ids/id-generator';

export class InMemoryWeeklyChallengeRepository implements WeeklyChallengeRepository {
  private readonly challengesById = new Map<string, WeeklyChallenge>();

  constructor(
    seed: readonly WeeklyChallenge[],
    private readonly idGenerator: IdGenerator,
  ) {
    seed.forEach((challenge) => this.challengesById.set(challenge.id, challenge));
  }

  async findCurrentByChildId(childId: string): Promise<WeeklyChallenge | null> {
    const challenge = [...this.challengesById.values()].find(
      (candidate) => candidate.childId === childId,
    );
    return challenge ?? null;
  }

  async create(newChallenge: Omit<WeeklyChallenge, 'id'>): Promise<WeeklyChallenge> {
    const challenge: WeeklyChallenge = { ...newChallenge, id: this.idGenerator.next() };
    this.challengesById.set(challenge.id, challenge);
    return challenge;
  }

  async save(challenge: WeeklyChallenge): Promise<void> {
    this.challengesById.set(challenge.id, challenge);
  }
}
