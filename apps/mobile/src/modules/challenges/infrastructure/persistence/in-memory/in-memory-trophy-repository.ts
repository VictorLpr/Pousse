import type { Trophy } from '@/modules/challenges/domain/entities/trophy';
import type { TrophyRepository } from '@/modules/challenges/domain/ports/trophy-repository';
import type { IdGenerator } from '@/shared/domain/ports/id-generator';

export class InMemoryTrophyRepository implements TrophyRepository {
  private readonly trophiesById = new Map<string, Trophy>();

  constructor(
    seed: readonly Trophy[],
    private readonly idGenerator: IdGenerator,
  ) {
    seed.forEach((trophy) => this.trophiesById.set(trophy.id, trophy));
  }

  async findByChildId(childId: string): Promise<Trophy[]> {
    const byEarnedFirst = (a: Trophy, b: Trophy) =>
      Number(b.status === 'earned') - Number(a.status === 'earned');

    return [...this.trophiesById.values()]
      .filter((trophy) => trophy.childId === childId)
      .sort(byEarnedFirst);
  }

  async create(newTrophy: Omit<Trophy, 'id'>): Promise<Trophy> {
    const trophy: Trophy = { id: this.idGenerator.next(), ...newTrophy };
    this.trophiesById.set(trophy.id, trophy);
    return trophy;
  }
}
