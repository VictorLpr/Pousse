import type { ParentAccount } from '@/modules/auth/domain/entities/parent-account';
import type { ChildRecord } from '@/modules/auth/infrastructure/persistence/in-memory/in-memory-child-repository';

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

/** Léa is 8 (age range 8-12) and Tom 5 (4-7) in late 2026. */
export const seedChildren: readonly ChildRecord[] = [
  {
    id: LEA_ID,
    parentId: PARENT_ID,
    firstName: 'Léa',
    birthDate: '2018-03-14',
    avatar: null,
    reminder: { time: '20:00', enabled: true },
  },
  {
    id: TOM_ID,
    parentId: PARENT_ID,
    firstName: 'Tom',
    birthDate: '2021-06-02',
    avatar: null,
    reminder: { time: '20:00', enabled: true },
  },
];
