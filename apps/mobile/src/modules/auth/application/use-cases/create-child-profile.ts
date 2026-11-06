import type { AgeRange, Child } from '@/modules/auth/domain/entities/child';
import { AuthError } from '@/modules/auth/domain/errors/auth-error';
import type { ChildRepository } from '@/modules/auth/domain/ports/child-repository';

export interface CreateChildProfileInput {
  readonly householdId: string;
  readonly firstName: string;
  readonly ageRange: AgeRange;
  readonly reminderTime: string;
}

/**
 * Creates the child profile. Its first weekly challenge is drawn by the
 * backend, not set up here (see AGENTS.md).
 */
export class CreateChildProfile {
  constructor(private readonly children: ChildRepository) {}

  async execute(input: CreateChildProfileInput): Promise<Child> {
    const firstName = input.firstName.trim();
    if (firstName.length === 0) {
      throw new AuthError('FIRST_NAME_REQUIRED', 'First name is required.');
    }

    return this.children.create({
      householdId: input.householdId,
      firstName,
      ageRange: input.ageRange,
      reminder: { time: input.reminderTime, enabled: true },
    });
  }
}
