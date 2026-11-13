import type { Child } from '@/modules/auth/domain/entities/child';
import type { ChildRepository } from '@/modules/auth/domain/ports/child-repository';

/** The household's children: those of the signed-in parent. */
export class ListChildren {
  constructor(private readonly children: ChildRepository) {}

  execute(parentId: string): Promise<Child[]> {
    return this.children.findByParentId(parentId);
  }
}
