import type { Badge } from '@/modules/challenges/domain/entities/badge';
import type { BadgeRepository } from '@/modules/challenges/domain/ports/badge-repository';

/** The whole badge catalog, with the ones the child already earned. */
export class GetBadges {
  constructor(private readonly badges: BadgeRepository) {}

  execute(childId: string): Promise<Badge[]> {
    return this.badges.findByChildId(childId);
  }
}
