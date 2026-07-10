import type { Trophy } from '@/domain/entities/trophy';
import type { TrophyRepository } from '@/domain/ports/trophy-repository';

export class GetTrophies {
  constructor(private readonly trophies: TrophyRepository) {}

  execute(childId: string): Promise<Trophy[]> {
    return this.trophies.findByChildId(childId);
  }
}
