import type { Challenge } from './challenge';

/**
 * proposed → chosen → completed, or expired once its week is over. The choice
 * is final: no going back to `proposed`, no switching challenge.
 */
export type ChildChallengeStatus = 'proposed' | 'chosen' | 'completed' | 'expired';

/** A challenge offered to a child for one week. */
export interface ChildChallenge {
  readonly id: string;
  readonly status: ChildChallengeStatus;
  /** Monday of the week (YYYY-MM-DD); the week ends six days later. */
  readonly weekStart: string;
  readonly chosenAt: Date | null;
  readonly completedAt: Date | null;
  readonly challenge: Challenge;
}

/** The week's three proposals, as `GET /challenges/week` returns them. */
export interface WeekChallenges {
  readonly weekStart: string;
  readonly challenges: readonly ChildChallenge[];
}

export function withChallengeChosen(childChallenge: ChildChallenge, at: Date): ChildChallenge {
  return { ...childChallenge, status: 'chosen', chosenAt: at };
}

export function withChallengeCompleted(childChallenge: ChildChallenge, at: Date): ChildChallenge {
  return { ...childChallenge, status: 'completed', completedAt: at };
}

export function withChallengeExpired(childChallenge: ChildChallenge): ChildChallenge {
  return { ...childChallenge, status: 'expired' };
}

/** Whether the challenge is the week's pick: one per week, chosen or already completed. */
export function isTaken(childChallenge: ChildChallenge): boolean {
  return childChallenge.status === 'chosen' || childChallenge.status === 'completed';
}

/** The challenge picked this week, or null while the three are still proposals. */
export function takenChallengeOf(week: WeekChallenges): ChildChallenge | null {
  return week.challenges.find(isTaken) ?? null;
}
