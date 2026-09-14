import type { ParentAccount } from '../entities/parent-account';

export interface ParentAccountRepository {
  findByEmail(email: string): Promise<ParentAccount | null>;
  findById(id: string): Promise<ParentAccount | null>;
  save(account: ParentAccount): Promise<void>;
}
