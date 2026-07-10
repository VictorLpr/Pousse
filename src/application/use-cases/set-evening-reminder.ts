import type { Child } from '@/domain/entities/child';
import { withReminderEnabled } from '@/domain/entities/child';
import type { ChildRepository } from '@/domain/ports/child-repository';

export class SetEveningReminder {
  constructor(private readonly children: ChildRepository) {}

  async execute(childId: string, enabled: boolean): Promise<Child> {
    const child = await this.children.findById(childId);
    if (!child) {
      throw new Error(`Enfant introuvable : ${childId}`);
    }

    const updatedChild = withReminderEnabled(child, enabled);
    await this.children.save(updatedChild);
    return updatedChild;
  }
}
