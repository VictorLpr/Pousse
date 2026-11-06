import type { ParentAccount } from '../entities/parent-account';

/** Sign-up and sign-in go through `AuthGateway`; this port only links an account to its household. */
export interface ParentAccountRepository {
  findById(id: string): Promise<ParentAccount | null>;
  save(account: ParentAccount): Promise<void>;
}
