import type { Household } from '@/modules/auth/domain/entities/household';
import type { ParentAccount } from '@/modules/auth/domain/entities/parent-account';
import type { HouseholdRepository } from '@/modules/auth/domain/ports/household-repository';
import type { ParentAccountRepository } from '@/modules/auth/domain/ports/parent-account-repository';

export interface SignInParentResult {
  readonly account: ParentAccount;
  readonly household: Household | null;
}

export class SignInParent {
  constructor(
    private readonly accounts: ParentAccountRepository,
    private readonly households: HouseholdRepository,
  ) {}

  async execute(email: string, password: string): Promise<SignInParentResult> {
    const account = await this.accounts.findByEmail(email.trim().toLowerCase());
    if (!account || account.password !== password) {
      throw new Error('Email ou mot de passe incorrect.');
    }

    const household = account.householdId
      ? await this.households.findById(account.householdId)
      : null;
    return { account, household };
  }
}
