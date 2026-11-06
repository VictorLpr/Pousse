import type { Household } from '@/modules/auth/domain/entities/household';
import type { ParentProfile } from '@/modules/auth/domain/entities/parent-account';
import type { AuthGateway } from '@/modules/auth/domain/ports/auth-gateway';
import type { HouseholdRepository } from '@/modules/auth/domain/ports/household-repository';

export interface SignInParentResult {
  readonly account: ParentProfile;
  readonly household: Household | null;
}

export class SignInParent {
  constructor(
    private readonly auth: AuthGateway,
    private readonly households: HouseholdRepository,
  ) {}

  async execute(email: string, password: string): Promise<SignInParentResult> {
    const account = await this.auth.signIn({ email, password });
    const household = account.householdId
      ? await this.households.findById(account.householdId)
      : null;
    return { account, household };
  }
}
