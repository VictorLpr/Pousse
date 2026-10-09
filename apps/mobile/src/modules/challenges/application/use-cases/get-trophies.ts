import type { Trophy } from '@/modules/challenges/domain/entities/trophy';
import type { TrophyRepository } from '@/modules/challenges/domain/ports/trophy-repository';

export class GetTrophies {
  constructor(private readonly trophies: TrophyRepository) {}

  execute(childId: string): Promise<Trophy[]> {
    return this.trophies.findByChildId(childId);
  }
}
