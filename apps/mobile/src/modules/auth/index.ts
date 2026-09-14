/**
 * API publique du module auth : ce que les autres modules ont le droit
 * d'importer. Ne jamais importer un chemin `@/modules/auth/domain/**` ou
 * `@/modules/auth/infrastructure/**` depuis un autre module (voir AGENTS.md).
 */
export { CreateChildProfile } from '@/modules/auth/application/use-cases/create-child-profile';
export { CreateHousehold } from '@/modules/auth/application/use-cases/create-household';
export { GetChild } from '@/modules/auth/application/use-cases/get-child';
export { ListChildren } from '@/modules/auth/application/use-cases/list-children';
export { RegisterParent } from '@/modules/auth/application/use-cases/register-parent';
export { SetEveningReminder } from '@/modules/auth/application/use-cases/set-evening-reminder';
export { SignInParent } from '@/modules/auth/application/use-cases/sign-in-parent';
export {
  AGE_RANGES,
  eveningsUntilNextTrophy,
  withIncrementedStreak,
} from '@/modules/auth/domain/entities/child';
export type { Child, AgeRange } from '@/modules/auth/domain/entities/child';
export type { ChildRepository } from '@/modules/auth/domain/ports/child-repository';
export type { Household } from '@/modules/auth/domain/entities/household';
export type { ParentAccount } from '@/modules/auth/domain/entities/parent-account';
