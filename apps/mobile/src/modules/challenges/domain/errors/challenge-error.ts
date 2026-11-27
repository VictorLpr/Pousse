/**
 * The API's challenge error codes, so the HTTP adapter can map responses onto
 * the same errors: 409 `CHALLENGE_ALREADY_CHOSEN` (another challenge of the
 * week is taken) and `INVALID_CHALLENGE_TRANSITION` (choosing a challenge that
 * isn't proposed, completing one that isn't chosen), 422 `DATE_OUT_OF_RANGE`,
 * 404 `CHILD_NOT_FOUND` / `CHILD_CHALLENGE_NOT_FOUND`, and 400
 * `VALIDATION_FAILED` for a malformed day.
 */
export type ChallengeErrorCode =
  | 'CHALLENGE_ALREADY_CHOSEN'
  | 'INVALID_CHALLENGE_TRANSITION'
  | 'DATE_OUT_OF_RANGE'
  | 'CHILD_NOT_FOUND'
  | 'CHILD_CHALLENGE_NOT_FOUND'
  | 'VALIDATION_FAILED';

/** Business error the UI turns into display copy through its `code`. */
export class ChallengeError extends Error {
  constructor(
    readonly code: ChallengeErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'ChallengeError';
  }
}
