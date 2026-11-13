/**
 * Codes aligned with the API's error codes (BetterAuth's, `/children`'s)
 * where one exists, so the HTTP adapter can map responses onto the same
 * errors. `FIRST_NAME_REQUIRED` and `BIRTH_DATE_INVALID` are the client's
 * reading of the API's generic `VALIDATION_FAILED`.
 */
export type AuthErrorCode =
  | 'INVALID_EMAIL'
  | 'PASSWORD_TOO_SHORT'
  | 'PASSWORD_TOO_LONG'
  | 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL'
  | 'INVALID_EMAIL_OR_PASSWORD'
  | 'FIRST_NAME_REQUIRED'
  | 'BIRTH_DATE_INVALID'
  | 'CHILD_AGE_OUT_OF_RANGE';

/** Business error the UI turns into display copy through its `code`. */
export class AuthError extends Error {
  constructor(
    readonly code: AuthErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}
