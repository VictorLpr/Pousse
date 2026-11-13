import type { Child } from '@/modules/auth/domain/entities/child';
import { AuthError } from '@/modules/auth/domain/errors/auth-error';
import type { ChildRepository } from '@/modules/auth/domain/ports/child-repository';

export interface CreateChildProfileInput {
  readonly parentId: string;
  readonly firstName: string;
  /** Calendar date, `YYYY-MM-DD`; the backend checks the child is 4 to 12. */
  readonly birthDate: string;
  readonly reminderTime: string;
}

/**
 * Creates the child profile. Its age range and first weekly challenge come
 * from the backend, not from here (see AGENTS.md).
 */
export class CreateChildProfile {
  constructor(private readonly children: ChildRepository) {}

  async execute(input: CreateChildProfileInput): Promise<Child> {
    const firstName = input.firstName.trim();
    if (firstName.length === 0) {
      throw new AuthError('FIRST_NAME_REQUIRED', 'First name is required.');
    }

    return this.children.create({
      parentId: input.parentId,
      firstName,
      birthDate: input.birthDate,
      avatar: null,
      reminder: { time: input.reminderTime, enabled: true },
    });
  }
}
