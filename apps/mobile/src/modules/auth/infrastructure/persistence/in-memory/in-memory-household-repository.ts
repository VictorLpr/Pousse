import type { Household } from '@/modules/auth/domain/entities/household';
import type { HouseholdRepository } from '@/modules/auth/domain/ports/household-repository';
import type { IdGenerator } from '@/shared/domain/ports/id-generator';

export class InMemoryHouseholdRepository implements HouseholdRepository {
  private readonly householdsById = new Map<string, Household>();

  constructor(
    seed: readonly Household[],
    private readonly idGenerator: IdGenerator,
  ) {
    seed.forEach((household) => this.householdsById.set(household.id, household));
  }

  async findById(id: string): Promise<Household | null> {
    return this.householdsById.get(id) ?? null;
  }

  async create(newHousehold: Omit<Household, 'id'>): Promise<Household> {
    const household: Household = { ...newHousehold, id: this.idGenerator.next() };
    this.householdsById.set(household.id, household);
    return household;
  }
}
