import type { ParentAccount } from '@/modules/auth/domain/entities/parent-account';
import type { IdGenerator } from '@/shared/domain/ports/id-generator';
import type { ParentAccountRepository } from '@/modules/auth/domain/ports/parent-account-repository';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const MIN_PASSWORD_LENGTH = 6;

export class RegisterParent {
  constructor(
    private readonly accounts: ParentAccountRepository,
    private readonly idGenerator: IdGenerator,
  ) {}

  async execute(email: string, password: string): Promise<ParentAccount> {
    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      throw new Error('Adresse email invalide.');
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new Error(`Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`);
    }
    if (await this.accounts.findByEmail(normalizedEmail)) {
      throw new Error('Un compte existe déjà avec cet email.');
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
