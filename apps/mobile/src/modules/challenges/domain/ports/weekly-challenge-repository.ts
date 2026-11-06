import type { WeeklyChallenge } from '../entities/weekly-challenge';

export interface WeeklyChallengeRepository {
  /** The backend draws the week's challenge: a new child gets one without any set-up call. */
  findCurrentByChildId(childId: string): Promise<WeeklyChallenge | null>;
  create(challenge: Omit<WeeklyChallenge, 'id'>): Promise<WeeklyChallenge>;
  save(challenge: WeeklyChallenge): Promise<void>;
}
