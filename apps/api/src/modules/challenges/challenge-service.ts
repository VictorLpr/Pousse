import { createHash } from 'node:crypto';

import type { ChildService } from '#/modules/auth/index.js';
import type { BadgeService } from '#/modules/challenges/badge-service.js';
import type {
  ChallengeRepository,
  ChildChallengeRow,
  DrawableChallenge,
} from '#/modules/challenges/challenge-repository.js';
import type {
  ChildChallengeResponse,
  ChildChallengeStatus,
  CompleteChallengeResponse,
  WeekResponse,
} from '#/modules/challenges/challenge-schemas.js';
import { addDays, daysBetween, mondayOf } from '#/modules/challenges/week.js';
import { AppError, ConflictError, NotFoundError, ValidationError } from '#/shared/errors/index.js';

/** How many challenges a child is offered each week (ADR-0005). */
export const CHALLENGES_PER_WEEK = 3;

/**
 * How far a local date may be from the UTC date: every time zone's local day
 * is within one day of it.
 */
export const MAX_DAYS_FROM_UTC = 1;

/** The age range every child also draws from, whatever its own. */
const ALL_AGES = '4-12';

const UNIQUE_ONE_TAKEN_PER_WEEK = 'child_challenge_one_taken_per_week_idx';

/** True when `error`, or one of its causes, is that unique index's violation. */
function isOneTakenPerWeekViolation(error: unknown): boolean {
  for (let current = error; current instanceof Object; current = (current as Error).cause) {
    const { code, constraint } = current as { code?: unknown; constraint?: unknown };
    if (code === '23505' && constraint === UNIQUE_ONE_TAKEN_PER_WEEK) return true;
  }
  return false;
}

/**
 * The draw's order for one child and one week: a hash of both with the
 * challenge's code. It changes from child to child and week to week, yet
 * the same week always draws the same challenges, so two draws racing on it
 * agree.
 */
function drawRank(childId: string, weekStart: string, code: string): string {
  return createHash('sha256').update(`${childId}:${weekStart}:${code}`).digest('hex');
}

/**
 * Picks the week's challenges: those not offered the week before first,
 * then, when the catalog runs short, the others.
 */
export function drawChallenges(
  childId: string,
  weekStart: string,
  drawable: readonly DrawableChallenge[],
  lastWeekIds: ReadonlySet<number>,
): number[] {
  const ranked = drawable
    .map((entry) => ({ entry, rank: drawRank(childId, weekStart, entry.code) }))
    .sort((a, b) => (a.rank < b.rank ? -1 : a.rank > b.rank ? 1 : 0))
    .map(({ entry }) => entry);
  const fresh = ranked.filter(({ id }) => !lastWeekIds.has(id));
  const repeated = ranked.filter(({ id }) => lastWeekIds.has(id));
  return [...fresh, ...repeated].slice(0, CHALLENGES_PER_WEEK).map(({ id }) => id);
}

function toResponse(row: ChildChallengeRow): ChildChallengeResponse {
  return {
    id: row.id,
    // No route leads to `abandoned`: a choice is final.
    status: row.status as ChildChallengeStatus,
    chosenAt: row.chosenAt?.toISOString() ?? null,
    completedAt: row.completedAt?.toISOString() ?? null,
    challenge: row.challenge,
  };
}

function childChallengeNotFound(id: string): NotFoundError {
  return new NotFoundError('CHILD_CHALLENGE_NOT_FOUND', `Child challenge not found: ${id}`);
}

function invalidTransition(row: ChildChallengeRow, to: string): ConflictError {
  return new ConflictError(
    'INVALID_CHALLENGE_TRANSITION',
    `Child challenge ${row.id} is ${row.status} and can't be ${to}`,
  );
}

/**
 * Weekly challenges: three drawn per child and per ISO week from the
 * child's age range and the all-ages one (service rules, ADR-0005), one of
 * them chosen for good, then completed. The database keeps one challenge
 * taken per week (`child_challenge_one_taken_per_week_idx`, answered as 409
 * `CHALLENGE_ALREADY_CHOSEN`) and dates that match the status.
 *
 * The week is the family's: the client sends its local day, the Monday is
 * deduced from it. Whether a child belongs to the parent, and its age range,
 * are asked to the auth module's service (ADR-0006).
 */
export function createChallengeService(
  {
    challenges,
    children,
    badges,
  }: {
    readonly challenges: ChallengeRepository;
    readonly children: ChildService;
    readonly badges: BadgeService;
  },
  { now = () => new Date() }: { readonly now?: () => Date } = {},
) {
  function assertNearToday(date: string): void {
    const utcToday = now().toISOString().slice(0, 10);
    if (Math.abs(daysBetween(utcToday, date)) > MAX_DAYS_FROM_UTC) {
      throw new ValidationError(
        'DATE_OUT_OF_RANGE',
        `Date ${date} is more than ${MAX_DAYS_FROM_UTC} day away from ${utcToday} (UTC)`,
      );
    }
  }

  /** The challenge, once its child is known to belong to the parent. */
  async function findOwn(parentId: string, id: string): Promise<ChildChallengeRow> {
    const row = await challenges.findById(id);
    if (!row) throw childChallengeNotFound(id);
    try {
      await children.get(parentId, row.childId);
    } catch (error) {
      // Another parent's challenge: don't reveal that it exists.
      if (error instanceof AppError && error.code === 'CHILD_NOT_FOUND') {
        throw childChallengeNotFound(id);
      }
      throw error;
    }
    return row;
  }

  async function reread(id: string): Promise<ChildChallengeResponse> {
    const row = await challenges.findById(id);
    if (!row) throw childChallengeNotFound(id);
    return toResponse(row);
  }

  return {
    /**
     * The child's challenges for the week of `today`, drawn on the first
     * call of the week. Challenges of earlier weeks left proposed or chosen
     * are expired first.
     */
    async week(parentId: string, childId: string, today: string): Promise<WeekResponse> {
      const child = await children.get(parentId, childId);
      assertNearToday(today);
      const weekStart = mondayOf(today);

      await challenges.expireBefore(childId, weekStart);
      let rows = await challenges.listWeek(childId, weekStart);
      if (rows.length === 0) {
        const drawable = await challenges.listDrawable([child.ageRange, ALL_AGES]);
        const lastWeek = await challenges.listWeekChallengeIds(childId, addDays(weekStart, -7));
        const drawn = drawChallenges(childId, weekStart, drawable, new Set(lastWeek));
        await challenges.offer(childId, weekStart, drawn);
        rows = await challenges.listWeek(childId, weekStart);
      }
      return { weekStart, challenges: rows.map(toResponse) };
    },

    /** Takes a proposed challenge on; the choice is final. */
    async choose(parentId: string, id: string): Promise<ChildChallengeResponse> {
      const row = await findOwn(parentId, id);
      if (row.status !== 'proposed') throw invalidTransition(row, 'chosen');
      try {
        if (!(await challenges.choose(id, now()))) throw invalidTransition(row, 'chosen');
      } catch (error) {
        if (isOneTakenPerWeekViolation(error)) {
          throw new ConflictError(
            'CHALLENGE_ALREADY_CHOSEN',
            `Child ${row.childId} already took a challenge on the week of ${row.weekStart}`,
          );
        }
        throw error;
      }
      return reread(id);
    },

    /** Completes the chosen challenge, then awards the challenge badges it earns. */
    async complete(parentId: string, id: string): Promise<CompleteChallengeResponse> {
      const row = await findOwn(parentId, id);
      // Never before `chosen_at`, which the database checks, even if the
      // clock stepped back since the choice.
      const completedAt = new Date(Math.max(now().getTime(), row.chosenAt?.getTime() ?? 0));
      if (row.status !== 'chosen' || !(await challenges.complete(id, completedAt))) {
        throw invalidTransition(row, 'completed');
      }
      const completedCategories = new Set(await challenges.listCompletedCategories(row.childId));
      const awardedBadges = await badges.awardForChallenges(row.childId, { completedCategories });
      return { ...(await reread(id)), awardedBadges };
    },
  };
}

export type ChallengeService = ReturnType<typeof createChallengeService>;
