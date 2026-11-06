import type { Child } from '@/modules/auth/domain/entities/child';
import type { ChildRepository } from '@/modules/auth/domain/ports/child-repository';
import type { IdGenerator } from '@/shared/domain/ports/id-generator';

export class InMemoryChildRepository implements ChildRepository {
  private readonly childrenById = new Map<string, Child>();

  constructor(
    seed: readonly Child[],
    private readonly idGenerator: IdGenerator,
  ) {
    seed.forEach((child) => this.childrenById.set(child.id, child));
  }

  async findByHouseholdId(householdId: string): Promise<Child[]> {
    return [...this.childrenById.values()].filter((child) => child.householdId === householdId);
  }

  async findById(id: string): Promise<Child | null> {
    return this.childrenById.get(id) ?? null;
  }

  async create(newChild: Omit<Child, 'id'>): Promise<Child> {
    const child: Child = { ...newChild, id: this.idGenerator.next() };
    this.childrenById.set(child.id, child);
    return child;
  }

  async save(child: Child): Promise<void> {
    this.childrenById.set(child.id, child);
  }
}
