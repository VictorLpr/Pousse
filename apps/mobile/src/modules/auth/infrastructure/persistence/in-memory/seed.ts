import type { Child } from '@/modules/auth/domain/entities/child';
import type { Household } from '@/modules/auth/domain/entities/household';
import type { ParentAccount } from '@/modules/auth/domain/entities/parent-account';

/** Compte de démonstration affiché sur l'écran de connexion. */
export const DEMO_EMAIL = 'parent@demo.fr';
export const DEMO_PASSWORD = 'pousse123';

export const HOUSEHOLD_ID = 'household-dupont';
export const LEA_ID = 'child-lea';
export const TOM_ID = 'child-tom';

export const seedHouseholds: readonly Household[] = [{ id: HOUSEHOLD_ID, name: 'Dupont' }];

export const seedParentAccounts: readonly ParentAccount[] = [
  {
    id: 'parent-demo',
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    householdId: HOUSEHOLD_ID,
  },
];

export const seedChildren: readonly Child[] = [
  {
    id: LEA_ID,
    householdId: HOUSEHOLD_ID,
    firstName: 'Léa',
    ageRange: '7-9',
    reminder: { time: '20:00', enabled: true },
    streakInEvenings: 3,
  },
  {
    id: TOM_ID,
    householdId: HOUSEHOLD_ID,
    firstName: 'Tom',
    ageRange: '4-6',
    reminder: { time: '20:00', enabled: true },
    streakInEvenings: 0,
  },
];
