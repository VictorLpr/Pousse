import type { Household } from '../entities/household';

export interface HouseholdRepository {
  findById(id: string): Promise<Household | null>;
  create(household: Omit<Household, 'id'>): Promise<Household>;
}
