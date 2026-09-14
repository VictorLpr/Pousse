import type { Household } from '../entities/household';

export interface HouseholdRepository {
  findById(id: string): Promise<Household | null>;
  save(household: Household): Promise<void>;
}
