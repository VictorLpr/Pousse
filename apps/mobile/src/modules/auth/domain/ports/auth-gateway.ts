import type { ParentNameUpdate, ParentProfile } from '../entities/parent-account';

export interface EmailCredentials {
  readonly email: string;
  readonly password: string;
}

/**
 * Mirrors BetterAuth's email/password client (`signUp.email`, `signIn.email`,
 * `signOut`, `updateUser`, `getSession`). The server owns validation and email
 * uniqueness: failures are thrown as `AuthError` with the API's codes.
 */
export interface AuthGateway {
  /**
   * The parent whose session is still open from a previous launch, or `null`
   * (`GET /auth/get-session`). Throws when the server can't be reached.
   */
  getSession(): Promise<ParentProfile | null>;
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
