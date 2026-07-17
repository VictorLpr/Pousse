import type { Household } from '@/domain/entities/household';
import { withHousehold } from '@/domain/entities/parent-account';
import type { HouseholdRepository } from '@/domain/ports/household-repository';
import type { IdGenerator } from '@/domain/ports/id-generator';
import type { ParentAccountRepository } from '@/domain/ports/parent-account-repository';

export class CreateHousehold {
  constructor(
    private readonly households: HouseholdRepository,
    private readonly accounts: ParentAccountRepository,
    private readonly idGenerator: IdGenerator,
  ) {}

  async execute(accountId: string, name: string): Promise<Household> {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      throw new Error('Le nom du foyer est requis.');
    }

    const account = await this.accounts.findById(accountId);
    if (!account) {
      throw new Error(`Compte introuvable : ${accountId}`);
    }

    const household: Household = { id: this.idGenerator.next(), name: trimmedName };
    await this.households.save(household);
    await this.accounts.save(withHousehold(account, household.id));
    return household;
  }
}
