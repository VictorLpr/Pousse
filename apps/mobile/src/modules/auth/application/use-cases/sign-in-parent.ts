import type { ParentProfile } from '@/modules/auth/domain/entities/parent-account';
import type { AuthGateway } from '@/modules/auth/domain/ports/auth-gateway';

export class SignInParent {
  constructor(private readonly auth: AuthGateway) {}

  async execute(email: string, password: string): Promise<ParentProfile> {
    return this.auth.signIn({ email, password });
  }
}
