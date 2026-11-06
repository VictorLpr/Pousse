import type { Child } from '../entities/child';

export interface ChildRepository {
  findByHouseholdId(householdId: string): Promise<Child[]>;
  findById(id: string): Promise<Child | null>;
  create(child: Omit<Child, 'id'>): Promise<Child>;
  save(child: Child): Promise<void>;
}
