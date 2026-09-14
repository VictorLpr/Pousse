import type { Trophy } from '@/modules/defis/domain/entities/trophy';
import type { TrophyRepository } from '@/modules/defis/domain/ports/trophy-repository';

export class GetTrophies {
  constructor(private readonly trophies: TrophyRepository) {}

  execute(childId: string): Promise<Trophy[]> {
    return this.trophies.findByChildId(childId);
  }
}
