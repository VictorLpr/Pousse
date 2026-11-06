import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  toParentProfile,
  type ParentAccount,
  type ParentProfile,
} from '@/modules/auth/domain/entities/parent-account';
import { AuthError } from '@/modules/auth/domain/errors/auth-error';
import type { AuthGateway, EmailCredentials } from '@/modules/auth/domain/ports/auth-gateway';
import type { InMemoryParentAccountRepository } from '@/modules/auth/infrastructure/persistence/in-memory/in-memory-parent-account-repository';
import type { IdGenerator } from '@/shared/infrastructure/ids/id-generator';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

/**
 * Fake BetterAuth server: same checks, codes and English messages as
 * `POST /auth/sign-up/email` and `POST /auth/sign-in/email`.
 */
export class InMemoryAuthGateway implements AuthGateway {
  constructor(
    private readonly accounts: InMemoryParentAccountRepository,
    private readonly idGenerator: IdGenerator,
  ) {}

  async signUp({ email, password }: EmailCredentials): Promise<ParentProfile> {
    const normalizedEmail = normalizeEmail(email);
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      throw new AuthError('INVALID_EMAIL', 'Invalid email');
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new AuthError('PASSWORD_TOO_SHORT', 'Password too short');
    }
    if (password.length > MAX_PASSWORD_LENGTH) {
      throw new AuthError('PASSWORD_TOO_LONG', 'Password too long');
    }
    if (await this.accounts.findByEmail(normalizedEmail)) {
      throw new AuthError(
        'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL',
        'User already exists. Use another email.',
      );
    }

    const account: ParentAccount = {
      id: this.idGenerator.next(),
      email: normalizedEmail,
      password,
      householdId: null,
    };
    await this.accounts.save(account);
    return toParentProfile(account);
  }

  async signIn({ email, password }: EmailCredentials): Promise<ParentProfile> {
    const account = await this.accounts.findByEmail(normalizeEmail(email));
    if (!account || account.password !== password) {
      throw new AuthError('INVALID_EMAIL_OR_PASSWORD', 'Invalid email or password');
    }
    return toParentProfile(account);
  }

  async signOut(): Promise<void> {
    // No server-side session to revoke while the front end runs alone.
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
