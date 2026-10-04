/**
 * Codes aligned with the API's BetterAuth error codes where one exists, so
 * the HTTP adapter can map responses onto the same errors.
 */
export type AuthErrorCode =
  | 'INVALID_EMAIL'
  | 'PASSWORD_TOO_SHORT'
  | 'USER_ALREADY_EXISTS'
  | 'INVALID_EMAIL_OR_PASSWORD'
  | 'HOUSEHOLD_NAME_REQUIRED'
  | 'FIRST_NAME_REQUIRED';

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
