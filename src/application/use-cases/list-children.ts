import type { Child } from '@/domain/entities/child';
import type { ChildRepository } from '@/domain/ports/child-repository';

export class ListChildren {
  constructor(private readonly children: ChildRepository) {}

  execute(): Promise<Child[]> {
    return this.children.findAll();
  }
}
