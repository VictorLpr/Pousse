import type { Trophy } from '@/modules/defis/domain/entities/trophy';
import type { TrophyRepository } from '@/modules/defis/domain/ports/trophy-repository';

export class InMemoryTrophyRepository implements TrophyRepository {
  private readonly trophiesById = new Map<string, Trophy>();

  constructor(seed: readonly Trophy[] = []) {
    seed.forEach((trophy) => this.trophiesById.set(trophy.id, trophy));
  }

  async findByChildId(childId: string): Promise<Trophy[]> {
    const byEarnedFirst = (a: Trophy, b: Trophy) =>
      Number(b.status === 'earned') - Number(a.status === 'earned');

    return [...this.trophiesById.values()]
      .filter((trophy) => trophy.childId === childId)
      .sort(byEarnedFirst);
  }

  async save(trophy: Trophy): Promise<void> {
    this.trophiesById.set(trophy.id, trophy);
  }
}
