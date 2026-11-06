/**
 * Same bounds as the API (`emailAndPassword` in `apps/api/src/modules/auth/auth.ts`).
 * The server enforces them; the UI only quotes them in its hints.
 */
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;

/** What the use cases hand to the UI: a parent account without its password. */
export interface ParentProfile {
  readonly id: string;
  readonly email: string;
  readonly householdId: string | null;
}

export interface ParentAccount extends ParentProfile {
  /** Plain text while the front end runs alone; hashed by the API (scrypt, ADR-0003). */
  readonly password: string;
}

/** Copies the public fields: a ParentAccount typed as ParentProfile would still carry its password. */
export function toParentProfile(account: ParentAccount): ParentProfile {
  return { id: account.id, email: account.email, householdId: account.householdId };
}

export function withHousehold(account: ParentAccount, householdId: string): ParentAccount {
  return { ...account, householdId };
}
