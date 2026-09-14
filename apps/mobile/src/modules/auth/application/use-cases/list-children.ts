import type { Child } from '@/modules/auth/domain/entities/child';
import type { ChildRepository } from '@/modules/auth/domain/ports/child-repository';

export class ListChildren {
  constructor(private readonly children: ChildRepository) {}

  execute(householdId: string): Promise<Child[]> {
    return this.children.findByHouseholdId(householdId);
  }
}
