import { AuthError } from '@/modules/auth/domain/errors/auth-error';
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  type ParentAccount,
} from '@/modules/auth/domain/entities/parent-account';
import type { IdGenerator } from '@/shared/domain/ports/id-generator';
import type { ParentAccountRepository } from '@/modules/auth/domain/ports/parent-account-repository';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export class RegisterParent {
  constructor(
    private readonly accounts: ParentAccountRepository,
    private readonly idGenerator: IdGenerator,
  ) {}

  async execute(email: string, password: string): Promise<ParentAccount> {
    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      throw new AuthError('INVALID_EMAIL', 'Invalid email address.');
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new AuthError(
        'PASSWORD_TOO_SHORT',
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
      );
    }
    if (password.length > MAX_PASSWORD_LENGTH) {
      throw new AuthError(
        'PASSWORD_TOO_LONG',
        `Password must be at most ${MAX_PASSWORD_LENGTH} characters long.`,
      );
    }
    if (await this.accounts.findByEmail(normalizedEmail)) {
      throw new AuthError('USER_ALREADY_EXISTS', 'An account already exists with this email.');
    }

    const account: ParentAccount = {
      id: this.idGenerator.next(),
      email: normalizedEmail,
      password,
      householdId: null,
    };
    await this.accounts.save(account);
    return account;
  }
}
