/**
 * API publique du module defis : ce que les autres modules ont le droit
 * d'importer. Ne jamais importer un chemin `@/modules/defis/domain/**` ou
 * `@/modules/defis/infrastructure/**` depuis un autre module (voir AGENTS.md).
 */
export { CompleteWeeklyChallenge } from '@/modules/defis/application/use-cases/complete-weekly-challenge';
export { GetTrophies } from '@/modules/defis/application/use-cases/get-trophies';
export { GetWeeklyChallenge } from '@/modules/defis/application/use-cases/get-weekly-challenge';
export { InitializeChildProgress } from '@/modules/defis/application/use-cases/initialize-child-progress';
export type { Trophy, TrophyStatus } from '@/modules/defis/domain/entities/trophy';
export type { WeeklyChallenge } from '@/modules/defis/domain/entities/weekly-challenge';
