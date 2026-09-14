export interface ParentAccount {
  readonly id: string;
  readonly email: string;
  /** En clair tant que le front est seul ; sera haché (Argon2) côté API. */
  readonly password: string;
  readonly householdId: string | null;
}

export function withHousehold(account: ParentAccount, householdId: string): ParentAccount {
  return { ...account, householdId };
}
