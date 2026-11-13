import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  toParentProfile,
  withParentName,
  type ParentAccount,
  type ParentNameUpdate,
  type ParentProfile,
} from '@/modules/auth/domain/entities/parent-account';
import { AuthError } from '@/modules/auth/domain/errors/auth-error';
import type { AuthGateway, EmailCredentials } from '@/modules/auth/domain/ports/auth-gateway';
import type { InMemoryParentAccountRepository } from '@/modules/auth/infrastructure/persistence/in-memory/in-memory-parent-account-repository';
import type { IdGenerator } from '@/shared/infrastructure/ids/id-generator';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

/**
 * Fake BetterAuth server: same checks, codes and English messages as
 * `POST /auth/sign-up/email`, `POST /auth/sign-in/email` and
 * `POST /auth/update-user`. Holds the one open session in place of the
 * session cookie.
 */
export class InMemoryAuthGateway implements AuthGateway {
  private sessionAccountId: string | null = null;

  constructor(
    private readonly accounts: InMemoryParentAccountRepository,
    private readonly idGenerator: IdGenerator,
  ) {}

  async signUp({ email, password }: EmailCredentials): Promise<ParentProfile> {
    const normalizedEmail = validEmail(email);
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
      firstName: null,
      lastName: null,
    };
    await this.accounts.save(account);
    this.sessionAccountId = account.id;
    return toParentProfile(account);
  }

  async signIn({ email, password }: EmailCredentials): Promise<ParentProfile> {
    const account = await this.accounts.findByEmail(validEmail(email));
    if (!account || account.password !== password) {
      throw new AuthError('INVALID_EMAIL_OR_PASSWORD', 'Invalid email or password');
    }
    this.sessionAccountId = account.id;
    return toParentProfile(account);
  }

  async signOut(): Promise<void> {
    this.sessionAccountId = null;
  }

  async updateUser(update: ParentNameUpdate): Promise<void> {
    const account = this.sessionAccountId
      ? await this.accounts.findById(this.sessionAccountId)
      : null;
    if (!account) {
      // The API answers 401 without a session; screens guard on the session first.
      throw new Error('No session to update.');
    }
    await this.accounts.save(withParentName(account, update));
  }
}

/** Both endpoints reject a malformed email with `INVALID_EMAIL` before anything else. */
function validEmail(email: string): string {
  const normalizedEmail = email.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    throw new AuthError('INVALID_EMAIL', 'Invalid email');
  }
  return normalizedEmail;
}
