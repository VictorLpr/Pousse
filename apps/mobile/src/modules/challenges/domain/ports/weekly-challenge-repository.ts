import type { WeeklyChallenge } from '../entities/weekly-challenge';

export interface WeeklyChallengeRepository {
  findCurrentByChildId(childId: string): Promise<WeeklyChallenge | null>;
  save(challenge: WeeklyChallenge): Promise<void>;
}
