import type { AgeRange, Child } from '@/modules/auth/domain/entities/child';
import { AuthError } from '@/modules/auth/domain/errors/auth-error';
import type { ChildRepository } from '@/modules/auth/domain/ports/child-repository';
import type { InitializeChildProgress } from '@/modules/challenges';
import type { IdGenerator } from '@/shared/domain/ports/id-generator';

export interface CreateChildProfileInput {
  readonly householdId: string;
  readonly firstName: string;
  readonly ageRange: AgeRange;
  readonly reminderTime: string;
}

/**
 * Creates the child profile, then delegates to the challenges module the
 * setup of its first challenge and trophy slots: this module never touches
 * another module's repository directly (see AGENTS.md).
 */
export class CreateChildProfile {
  constructor(
    private readonly children: ChildRepository,
    private readonly idGenerator: IdGenerator,
    private readonly initializeChildProgress: InitializeChildProgress,
  ) {}

  async execute(input: CreateChildProfileInput): Promise<Child> {
    const firstName = input.firstName.trim();
    if (firstName.length === 0) {
      throw new AuthError('FIRST_NAME_REQUIRED', 'First name is required.');
    }

    const child: Child = {
      id: this.idGenerator.next(),
      householdId: input.householdId,
      firstName,
      ageRange: input.ageRange,
      reminder: { time: input.reminderTime, enabled: true },
      streakInEvenings: 0,
    };
    await this.children.save(child);
    await this.initializeChildProgress.execute(child.id);

    return child;
  }
}
