/**
 * Public API of the challenges module: what other modules are allowed to
 * import. Never import a `@/modules/challenges/domain/**` or
 * `@/modules/challenges/infrastructure/**` path from another module (see AGENTS.md).
 */
export { ChooseChallenge } from '@/modules/challenges/application/use-cases/choose-challenge';
export { CompleteChallenge } from '@/modules/challenges/application/use-cases/complete-challenge';
export { GetTrophies } from '@/modules/challenges/application/use-cases/get-trophies';
export { GetWeekChallenges } from '@/modules/challenges/application/use-cases/get-week-challenges';
export type {
  Challenge,
  ChallengeAgeRange,
  ChallengeCategory,
} from '@/modules/challenges/domain/entities/challenge';
export type {
  ChildChallenge,
  ChildChallengeStatus,
  WeekChallenges,
} from '@/modules/challenges/domain/entities/child-challenge';
export type { Trophy, TrophyStatus } from '@/modules/challenges/domain/entities/trophy';
