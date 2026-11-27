import type { Badge } from '../entities/badge';

export interface BadgeRepository {
  /**
   * The whole badge catalog, in catalog order, with when the child earned
   * each one (`GET /challenges/badges?childId=`). Badges are awarded by the
   * backend, never by the client. Throws `ChallengeError`: `CHILD_NOT_FOUND`.
   */
  findByChildId(childId: string): Promise<Badge[]>;
}
