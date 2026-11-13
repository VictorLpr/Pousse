import {
  withParentName,
  type ParentNameUpdate,
  type ParentProfile,
} from '@/modules/auth/domain/entities/parent-account';
import type { AuthGateway } from '@/modules/auth/domain/ports/auth-gateway';

/**
 * Renames the signed-in parent; the last name is the household's display
 * name. Returns the updated profile, since the server only answers
 * `{ status: true }`.
 */
export class UpdateParentName {
  constructor(private readonly auth: AuthGateway) {}

  async execute(parent: ParentProfile, update: ParentNameUpdate): Promise<ParentProfile> {
    const trimmed: ParentNameUpdate = {
      ...(update.firstName !== undefined && { firstName: update.firstName.trim() }),
      ...(update.lastName !== undefined && { lastName: update.lastName.trim() }),
    };
    await this.auth.updateUser(trimmed);
    return withParentName(parent, trimmed);
  }
}
