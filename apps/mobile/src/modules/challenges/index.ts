/**
 * Public API of the challenges module: what other modules are allowed to
 * import. Never import a `@/modules/challenges/domain/**` or
 * `@/modules/challenges/infrastructure/**` path from another module (see AGENTS.md).
 */
export { CompleteWeeklyChallenge } from '@/modules/challenges/application/use-cases/complete-weekly-challenge';
export { GetTrophies } from '@/modules/challenges/application/use-cases/get-trophies';
export { GetWeeklyChallenge } from '@/modules/challenges/application/use-cases/get-weekly-challenge';
export { InitializeChildProgress } from '@/modules/challenges/application/use-cases/initialize-child-progress';
export type { Trophy, TrophyStatus } from '@/modules/challenges/domain/entities/trophy';
export type { WeeklyChallenge } from '@/modules/challenges/domain/entities/weekly-challenge';
