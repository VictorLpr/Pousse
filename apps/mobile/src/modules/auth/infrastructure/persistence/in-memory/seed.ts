import type { Child } from '@/modules/auth/domain/entities/child';
import type { ParentAccount } from '@/modules/auth/domain/entities/parent-account';

/** Demo account shown on the sign-in screen. */
export const DEMO_EMAIL = 'parent@demo.fr';
export const DEMO_PASSWORD = 'pousse123';

export const PARENT_ID = 'parent-demo';
export const LEA_ID = 'child-lea';
export const TOM_ID = 'child-tom';

export const seedParentAccounts: readonly ParentAccount[] = [
  {
    id: PARENT_ID,
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    firstName: null,
    lastName: 'Dupont',
  },
];

export const seedChildren: readonly Child[] = [
  {
    id: LEA_ID,
    parentId: PARENT_ID,
    firstName: 'Léa',
    ageRange: '7-9',
    reminder: { time: '20:00', enabled: true },
  },
  {
    id: TOM_ID,
    parentId: PARENT_ID,
    firstName: 'Tom',
    ageRange: '4-6',
    reminder: { time: '20:00', enabled: true },
  },
];
