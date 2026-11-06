import type { ParentProfile } from '../entities/parent-account';

export interface EmailCredentials {
  readonly email: string;
  readonly password: string;
}

/**
 * Mirrors BetterAuth's email/password client (`signUp.email`, `signIn.email`,
 * `signOut`). The server owns validation and email uniqueness: failures are
 * thrown as `AuthError` with the API's codes.
 */
export interface AuthGateway {
  signUp(credentials: EmailCredentials): Promise<ParentProfile>;
  signIn(credentials: EmailCredentials): Promise<ParentProfile>;
  signOut(): Promise<void>;
}
