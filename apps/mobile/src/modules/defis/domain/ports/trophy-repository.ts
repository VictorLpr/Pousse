import type { Trophy } from '../entities/trophy';

export interface TrophyRepository {
  /** Retourne les trophées d'un enfant, gagnés en premier. */
  findByChildId(childId: string): Promise<Trophy[]>;
  save(trophy: Trophy): Promise<void>;
}
