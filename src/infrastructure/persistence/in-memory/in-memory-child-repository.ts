import type { Child } from '@/domain/entities/child';
import type { ChildRepository } from '@/domain/ports/child-repository';

export class InMemoryChildRepository implements ChildRepository {
  private readonly childrenById = new Map<string, Child>();

  constructor(seed: readonly Child[] = []) {
    seed.forEach((child) => this.childrenById.set(child.id, child));
  }

  async findByHouseholdId(householdId: string): Promise<Child[]> {
    return [...this.childrenById.values()].filter((child) => child.householdId === householdId);
  }

  async findById(id: string): Promise<Child | null> {
    return this.childrenById.get(id) ?? null;
  }

  async save(child: Child): Promise<void> {
    this.childrenById.set(child.id, child);
  }
}
