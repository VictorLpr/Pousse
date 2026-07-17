import type { Household } from '@/domain/entities/household';
import type { HouseholdRepository } from '@/domain/ports/household-repository';

export class InMemoryHouseholdRepository implements HouseholdRepository {
  private readonly householdsById = new Map<string, Household>();

  constructor(seed: readonly Household[] = []) {
    seed.forEach((household) => this.householdsById.set(household.id, household));
  }

  async findById(id: string): Promise<Household | null> {
    return this.householdsById.get(id) ?? null;
  }

  async save(household: Household): Promise<void> {
    this.householdsById.set(household.id, household);
  }
}
