import type { ParentAccount } from '@/modules/auth/domain/entities/parent-account';

/** The fake server's `user` table, read and written by `InMemoryAuthGateway` only. */
export class InMemoryParentAccountRepository {
  private readonly accountsById = new Map<string, ParentAccount>();

  constructor(seed: readonly ParentAccount[] = []) {
    seed.forEach((account) => this.accountsById.set(account.id, account));
  }

  async findByEmail(email: string): Promise<ParentAccount | null> {
    const account = [...this.accountsById.values()].find((candidate) => candidate.email === email);
    return account ?? null;
  }

  async findById(id: string): Promise<ParentAccount | null> {
    return this.accountsById.get(id) ?? null;
  }

  async save(account: ParentAccount): Promise<void> {
    this.accountsById.set(account.id, account);
  }
}
