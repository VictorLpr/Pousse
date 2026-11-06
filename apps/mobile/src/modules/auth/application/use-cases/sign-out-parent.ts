import type { AuthGateway } from '@/modules/auth/domain/ports/auth-gateway';

export class SignOutParent {
  constructor(private readonly auth: AuthGateway) {}

  async execute(): Promise<void> {
    await this.auth.signOut();
  }
}
