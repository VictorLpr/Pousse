import type {
  Challenge,
  ChallengeCategory,
  ChildAgeRange,
} from '@/modules/challenges/domain/entities/challenge';
import {
  isTaken,
  withChallengeChosen,
  withChallengeCompleted,
  withChallengeExpired,
  type ChildChallenge,
  type CompletedChallenge,
  type WeekChallenges,
} from '@/modules/challenges/domain/entities/child-challenge';
import { ChallengeError } from '@/modules/challenges/domain/errors/challenge-error';
import type { ChildChallengeRepository } from '@/modules/challenges/domain/ports/child-challenge-repository';
import type { InMemoryBadgeRepository } from '@/modules/challenges/infrastructure/persistence/in-memory/in-memory-badge-repository';
import type { IdGenerator } from '@/shared/infrastructure/ids/id-generator';
import {
  daysBetween,
  isCalendarDate,
  mondayOf,
  previousDay,
  utcDay,
} from '@/shared/infrastructure/time/calendar-day';
import type { Clock } from '@/shared/infrastructure/time/clock';

/** The API refuses a day further than this from its UTC date: it can't be anyone's today. */
const MAX_DAYS_FROM_UTC = 1;
const CHALLENGES_PER_WEEK = 3;

/** A catalog row: `active: false` retires a challenge from the draw. */
export interface CatalogChallenge extends Challenge {
  readonly active: boolean;
}

/** A `child_challenge` row: the API never returns `childId`, the session scopes it. */
export interface StoredChildChallenge {
  readonly childId: string;
  readonly childChallenge: ChildChallenge;
}

/**
 * Fake challenges API (`/challenges/week`, `/challenges/:id/choose`,
 * `/challenges/:id/complete`): same rules, codes and English messages, and a
 * completion awards the challenge badges it earns. The family's local day
 * always comes from the client; the clock only bounds it and stamps
 * `chosenAt` and `completedAt`.
 */
export class InMemoryChildChallengeRepository implements ChildChallengeRepository {
  private readonly rowsById = new Map<string, StoredChildChallenge>();

  constructor(
    private readonly catalog: readonly CatalogChallenge[],
    seed: readonly StoredChildChallenge[],
    /** The child's age range, null for an unknown child: the API asks the auth module (ADR-0006). */
    private readonly childAgeRange: (childId: string) => Promise<ChildAgeRange | null>,
    private readonly badges: InMemoryBadgeRepository,
    private readonly idGenerator: IdGenerator,
    private readonly clock: Clock,
  ) {
    seed.forEach((row) => this.rowsById.set(row.childChallenge.id, row));
  }

  async findWeek(childId: string, today: string): Promise<WeekChallenges> {
    if (!isCalendarDate(today)) {
      throw new ChallengeError('VALIDATION_FAILED', `Invalid day: ${today}`);
    }
    const ageRange = await this.childAgeRange(childId);
    if (!ageRange) {
      throw new ChallengeError('CHILD_NOT_FOUND', `Child not found: ${childId}`);
    }
    this.assertNearToday(today);

    const weekStart = mondayOf(today);
    this.expirePastWeeks(childId, weekStart);
    const existing = this.weekOf(childId, weekStart);
    const challenges = existing.length > 0 ? existing : this.draw(childId, ageRange, weekStart);
    return { weekStart, challenges };
  }

  async choose(childChallengeId: string): Promise<ChildChallenge> {
    const { childId, childChallenge } = this.rowOf(childChallengeId);
    if (childChallenge.status !== 'proposed') {
      throw new ChallengeError(
        'INVALID_CHALLENGE_TRANSITION',
        `Cannot choose a ${childChallenge.status} challenge: ${childChallengeId}`,
      );
    }
    if (this.weekOf(childId, childChallenge.weekStart).some(isTaken)) {
      throw new ChallengeError(
        'CHALLENGE_ALREADY_CHOSEN',
        `Child ${childId} already chose a challenge for the week of ${childChallenge.weekStart}`,
      );
    }
    return this.store(childId, withChallengeChosen(childChallenge, this.clock.now()));
  }

  async complete(childChallengeId: string): Promise<CompletedChallenge> {
    const { childId, childChallenge } = this.rowOf(childChallengeId);
    if (childChallenge.status !== 'chosen') {
      throw new ChallengeError(
        'INVALID_CHALLENGE_TRANSITION',
        `Cannot complete a ${childChallenge.status} challenge: ${childChallengeId}`,
      );
    }
    const completed = this.store(childId, withChallengeCompleted(childChallenge, this.clock.now()));
    const awardedBadges = this.badges.awardForChallenges(childId, {
      completedCategories: this.completedCategoriesOf(childId),
    });
    return { ...completed, awardedBadges };
  }

  private rowOf(childChallengeId: string): StoredChildChallenge {
    const row = this.rowsById.get(childChallengeId);
    if (!row) {
      throw new ChallengeError(
        'CHILD_CHALLENGE_NOT_FOUND',
        `Child challenge not found: ${childChallengeId}`,
      );
    }
    return row;
  }

  private completedCategoriesOf(childId: string): Set<ChallengeCategory> {
    return new Set(
      [...this.rowsById.values()]
        .filter((row) => row.childId === childId && row.childChallenge.status === 'completed')
        .map((row) => row.childChallenge.challenge.category),
    );
  }

  private store(childId: string, childChallenge: ChildChallenge): ChildChallenge {
    this.rowsById.set(childChallenge.id, { childId, childChallenge });
    return childChallenge;
  }

  private weekOf(childId: string, weekStart: string): ChildChallenge[] {
    return [...this.rowsById.values()]
      .filter((row) => row.childId === childId && row.childChallenge.weekStart === weekStart)
      .map((row) => row.childChallenge);
  }

  /** A week that is over can't be chosen nor completed any more. */
  private expirePastWeeks(childId: string, weekStart: string): void {
    for (const row of this.rowsById.values()) {
      const { status, weekStart: rowWeek } = row.childChallenge;
      if (
        row.childId === childId &&
        rowWeek < weekStart &&
        (status === 'proposed' || status === 'chosen')
      ) {
        this.store(childId, withChallengeExpired(row.childChallenge));
      }
    }
  }

  /**
   * Three active challenges of the child's range (or for every age), at
   * random, leaving out last week's when the catalog has enough others.
   */
  private draw(childId: string, ageRange: ChildAgeRange, weekStart: string): ChildChallenge[] {
    const lastWeekCodes = new Set(
      this.weekOf(childId, mondayOf(previousDay(weekStart))).map(({ challenge }) => challenge.code),
    );
    const eligible = shuffled(
      this.catalog.filter(
        (challenge) =>
          challenge.active && (challenge.ageRange === ageRange || challenge.ageRange === '4-12'),
      ),
    );
    const fresh = eligible.filter((challenge) => !lastWeekCodes.has(challenge.code));
    const repeated = eligible.filter((challenge) => lastWeekCodes.has(challenge.code));

    return [...fresh, ...repeated]
      .slice(0, CHALLENGES_PER_WEEK)
      .map(({ active: _active, ...challenge }) =>
        this.store(childId, {
          id: this.idGenerator.next(),
          status: 'proposed',
          weekStart,
          chosenAt: null,
          completedAt: null,
          challenge,
        }),
      );
  }

  private assertNearToday(day: string): void {
    const utcToday = utcDay(this.clock.now());
    if (Math.abs(daysBetween(utcToday, day)) > MAX_DAYS_FROM_UTC) {
      throw new ChallengeError(
        'DATE_OUT_OF_RANGE',
        `Date ${day} is more than ${MAX_DAYS_FROM_UTC} day away from ${utcToday} (UTC)`,
      );
    }
  }
}

/** A Fisher–Yates shuffled copy. */
function shuffled<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[other]] = [copy[other], copy[index]];
  }
  return copy;
}
