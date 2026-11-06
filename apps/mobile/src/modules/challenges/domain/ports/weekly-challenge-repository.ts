import type { WeeklyChallenge } from '../entities/weekly-challenge';

export interface WeeklyChallengeRepository {
  findCurrentByChildId(childId: string): Promise<WeeklyChallenge | null>;
  create(challenge: Omit<WeeklyChallenge, 'id'>): Promise<WeeklyChallenge>;
  save(challenge: WeeklyChallenge): Promise<void>;
}
