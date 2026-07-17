import type { ParentAccount } from '@/domain/entities/parent-account';
import type { ParentAccountRepository } from '@/domain/ports/parent-account-repository';

export class InMemoryParentAccountRepository implements ParentAccountRepository {
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
