import type {
  ChildChallenge,
  CompletedChallenge,
  WeekChallenges,
} from '../entities/child-challenge';

export interface ChildChallengeRepository {
  /**
   * The week of `today` (the family's local day, YYYY-MM-DD) and its three
   * challenges (`GET /challenges/week`). The backend draws them on the first
   * call of the week, from the child's age range, and expires what past weeks
   * left proposed or chosen; later calls return the same three. Throws
   * `ChallengeError`: `DATE_OUT_OF_RANGE` for a day more than one day away
   * from the UTC date, `CHILD_NOT_FOUND`, `VALIDATION_FAILED`.
   */
  findWeek(childId: string, today: string): Promise<WeekChallenges>;
  /**
   * Picks the week's challenge, for good (`POST /challenges/:id/choose`).
   * Throws `ChallengeError`: `CHALLENGE_ALREADY_CHOSEN` if another challenge
   * of the week is taken, `INVALID_CHALLENGE_TRANSITION` if this one isn't
   * proposed, `CHILD_CHALLENGE_NOT_FOUND`.
   */
  choose(childChallengeId: string): Promise<ChildChallenge>;
  /**
   * Marks the chosen challenge as done together (`POST /challenges/:id/complete`);
   * the backend then awards the challenge badges it earns. Throws
   * `ChallengeError`: `INVALID_CHALLENGE_TRANSITION` if it isn't chosen,
   * `CHILD_CHALLENGE_NOT_FOUND`.
   */
  complete(childChallengeId: string): Promise<CompletedChallenge>;
}
