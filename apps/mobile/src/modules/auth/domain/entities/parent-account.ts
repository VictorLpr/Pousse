/** Same bounds as the API (`emailAndPassword` in `apps/api/src/modules/auth/auth.ts`). */
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;

export interface ParentAccount {
  readonly id: string;
  readonly email: string;
  /** Plain text while the front end runs alone; hashed by the API (scrypt, ADR-0003). */
  readonly password: string;
  readonly householdId: string | null;
}

export function withHousehold(account: ParentAccount, householdId: string): ParentAccount {
  return { ...account, householdId };
}
