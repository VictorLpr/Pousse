import type { WeeklyChallenge } from '@/modules/challenges/domain/entities/weekly-challenge';
import type { WeeklyChallengeRepository } from '@/modules/challenges/domain/ports/weekly-challenge-repository';
import type { IdGenerator } from '@/shared/infrastructure/ids/id-generator';

export class InMemoryWeeklyChallengeRepository implements WeeklyChallengeRepository {
  private readonly challengesById = new Map<string, WeeklyChallenge>();
  private drawCount = 0;

  constructor(
    seed: readonly WeeklyChallenge[],
    private readonly titlePool: readonly string[],
    private readonly idGenerator: IdGenerator,
  ) {
    seed.forEach((challenge) => this.challengesById.set(challenge.id, challenge));
  }

  async findCurrentByChildId(childId: string): Promise<WeeklyChallenge | null> {
    const challenge = [...this.challengesById.values()].find(
      (candidate) => candidate.childId === childId,
    );
    return challenge ?? this.drawChallenge(childId);
  }

  async create(newChallenge: Omit<WeeklyChallenge, 'id'>): Promise<WeeklyChallenge> {
    const challenge: WeeklyChallenge = { ...newChallenge, id: this.idGenerator.next() };
    this.challengesById.set(challenge.id, challenge);
    return challenge;
  }

  async save(challenge: WeeklyChallenge): Promise<void> {
    this.challengesById.set(challenge.id, challenge);
  }

  /** Stands in for the API's weekly draw: a child without a challenge gets one. */
  private drawChallenge(childId: string): Promise<WeeklyChallenge | null> {
    if (this.titlePool.length === 0) {
      return Promise.resolve(null);
    }

    const title = this.titlePool[this.drawCount % this.titlePool.length];
    this.drawCount += 1;
    return this.create({ childId, title, completedTogether: false });
  }
}
