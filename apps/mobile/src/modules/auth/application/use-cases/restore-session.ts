import type { ParentProfile } from '@/modules/auth/domain/entities/parent-account';
import type { AuthGateway } from '@/modules/auth/domain/ports/auth-gateway';

/** At launch, finds the parent still signed in from a previous visit. */
export class RestoreSession {
  constructor(private readonly auth: AuthGateway) {}

  async execute(): Promise<ParentProfile | null> {
    return this.auth.getSession();
  }
}
