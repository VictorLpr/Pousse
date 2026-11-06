import type { Trophy } from '../entities/trophy';

export interface TrophyRepository {
  /** Returns a child's trophies, earned ones first. */
  findByChildId(childId: string): Promise<Trophy[]>;
  create(trophy: Omit<Trophy, 'id'>): Promise<Trophy>;
}
