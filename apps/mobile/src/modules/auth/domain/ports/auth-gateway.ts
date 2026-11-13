import type { ParentNameUpdate, ParentProfile } from '../entities/parent-account';

export interface EmailCredentials {
  readonly email: string;
  readonly password: string;
}

/**
 * Mirrors BetterAuth's email/password client (`signUp.email`, `signIn.email`,
 * `signOut`, `updateUser`). The server owns validation and email uniqueness:
 * failures are thrown as `AuthError` with the API's codes.
 */
export interface AuthGateway {
  /** Creates the account and opens its session, as BetterAuth does. */
  signUp(credentials: EmailCredentials): Promise<ParentProfile>;
  signIn(credentials: EmailCredentials): Promise<ParentProfile>;
  signOut(): Promise<void>;
  /**
   * Updates the signed-in parent (`POST /auth/update-user`, which needs a
   * session and answers `{ status: true }` without the user).
   */
  updateUser(update: ParentNameUpdate): Promise<void>;
}
