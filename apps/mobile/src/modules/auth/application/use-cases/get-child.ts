import type { Child } from '@/modules/auth/domain/entities/child';
import type { ChildRepository } from '@/modules/auth/domain/ports/child-repository';

export class GetChild {
  constructor(private readonly children: ChildRepository) {}

  async execute(childId: string): Promise<Child> {
    const child = await this.children.findById(childId);
    if (!child) {
      throw new Error(`Enfant introuvable : ${childId}`);
    }
    return child;
  }
}
