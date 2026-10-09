export interface WeeklyChallenge {
  readonly id: string;
  readonly childId: string;
  readonly title: string;
  readonly completedTogether: boolean;
}

export function withChallengeCompleted(challenge: WeeklyChallenge): WeeklyChallenge {
  return { ...challenge, completedTogether: true };
}
