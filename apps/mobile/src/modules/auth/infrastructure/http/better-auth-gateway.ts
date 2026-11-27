import type {
  ParentNameUpdate,
  ParentProfile,
} from '@/modules/auth/domain/entities/parent-account';
import { AuthError, type AuthErrorCode } from '@/modules/auth/domain/errors/auth-error';
import type { AuthGateway, EmailCredentials } from '@/modules/auth/domain/ports/auth-gateway';
import type { ParentAuthClient } from '@/modules/auth/infrastructure/http/parent-auth-client';

/** The BetterAuth codes the auth screens have display copy for. */
const BETTER_AUTH_CODES: ReadonlySet<AuthErrorCode> = new Set<AuthErrorCode>([
  'INVALID_EMAIL',
  'PASSWORD_TOO_SHORT',
  'PASSWORD_TOO_LONG',
  'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL',
  'INVALID_EMAIL_OR_PASSWORD',
]);

interface BetterAuthFailure {
  readonly code?: string;
  readonly message?: string;
  readonly status: number;
}

interface BetterAuthUser {
  readonly id: string;
  readonly email: string;
  readonly firstName?: string | null;
  readonly lastName?: string | null;
}

/**
 * `AuthGateway` over the API's BetterAuth routes (`/auth/*`, ADR-0003). The
 * session cookie is kept by the client set up for the platform
 * (`auth-client-setup.ts`), so it survives a new launch.
 */
export class BetterAuthGateway implements AuthGateway {
  constructor(private readonly client: ParentAuthClient) {}

  async getSession(): Promise<ParentProfile | null> {
    const { data, error } = await this.client.getSession();
    if (error) {
      throw toError(error, 'get-session');
    }
    return data ? toParentProfile(data.user) : null;
  }

  async signUp({ email, password }: EmailCredentials): Promise<ParentProfile> {
    // `name` is required by BetterAuth; the parent's names live in
    // `firstName` / `lastName`, set later from the household screen.
    const { data, error } = await this.client.signUp.email({ email, password, name: '' });
    if (error) {
      throw toError(error, 'sign-up');
    }
    return toParentProfile(data.user);
  }

  async signIn({ email, password }: EmailCredentials): Promise<ParentProfile> {
    const { data, error } = await this.client.signIn.email({ email, password });
    if (error) {
      throw toError(error, 'sign-in');
    }
    return toParentProfile(data.user);
  }

  async signOut(): Promise<void> {
    const { error } = await this.client.signOut();
    if (error) {
      throw toError(error, 'sign-out');
    }
  }

  async updateUser(update: ParentNameUpdate): Promise<void> {
    const { error } = await this.client.updateUser(update);
    if (error) {
      throw toError(error, 'update-user');
    }
  }
}

function toParentProfile(user: BetterAuthUser): ParentProfile {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
  };
}

/**
 * A code the screens know becomes an `AuthError`; anything else (rate limit,
 * server down) a plain `Error`, which they show with their fallback copy.
 */
function toError(failure: BetterAuthFailure, route: string): Error {
  const code = failure.code as AuthErrorCode | undefined;
  if (code && BETTER_AUTH_CODES.has(code)) {
    return new AuthError(code, failure.message ?? code);
  }
  return new Error(
    `BetterAuth ${route} failed with status ${failure.status}${failure.code ? ` (${failure.code})` : ''}.`,
  );
}
