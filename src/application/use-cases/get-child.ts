import type { Child } from '@/domain/entities/child';
import type { ChildRepository } from '@/domain/ports/child-repository';

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
