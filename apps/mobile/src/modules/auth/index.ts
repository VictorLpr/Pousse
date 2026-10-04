/**
 * Public API of the auth module: what other modules are allowed to import.
 * Never import a `@/modules/auth/domain/**` or
 * `@/modules/auth/infrastructure/**` path from another module (see AGENTS.md).
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
