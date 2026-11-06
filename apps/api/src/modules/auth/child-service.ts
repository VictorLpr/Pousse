import type { ChildRepository, ChildRow } from '#/modules/auth/child-repository.js';
import type {
  ChildAgeRange,
  ChildResponse,
  CreateChildInput,
  UpdateChildInput,
} from '#/modules/auth/child-schemas.js';
import { NotFoundError, ValidationError } from '#/shared/errors/index.js';

export const MIN_CHILD_AGE = 4;
export const MAX_CHILD_AGE = 12;

/** Today's date, `YYYY-MM-DD`, in UTC. */
function utcToday(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Age in whole years on `today`, both dates as `YYYY-MM-DD`. Someone born on
 * February 29 turns a year older on March 1 in non-leap years.
 */
export function ageOn(birthDate: string, today: string): number {
  const years = Number(today.slice(0, 4)) - Number(birthDate.slice(0, 4));
  return today.slice(5) < birthDate.slice(5) ? years - 1 : years;
}

/** A child past twelve stays in the older range rather than having none. */
export function ageRangeOf(age: number): ChildAgeRange {
  return age < 8 ? '4-7' : '8-12';
}

function childNotFound(id: string): NotFoundError {
  return new NotFoundError('CHILD_NOT_FOUND', `Child not found: ${id}`);
}

/**
 * Child profiles of the signed-in parent. Owns the rule the database can't
 * express (ADR-0005): a child is 4 to 12 years old when the profile is
 * created, and when its birth date is corrected. Age and age range are
 * computed at read time, never stored.
 */
export function createChildService(
  children: ChildRepository,
  { today = utcToday }: { readonly today?: () => string } = {},
) {
  function assertAgeInRange(birthDate: string): void {
    const age = ageOn(birthDate, today());
    if (age < MIN_CHILD_AGE || age > MAX_CHILD_AGE) {
      throw new ValidationError(
        'CHILD_AGE_OUT_OF_RANGE',
        `A child must be ${MIN_CHILD_AGE} to ${MAX_CHILD_AGE} years old`,
      );
    }
  }

  function toResponse(row: ChildRow): ChildResponse {
    return {
      id: row.id,
      firstName: row.firstName,
      birthDate: row.birthDate,
      ageRange: ageRangeOf(ageOn(row.birthDate, today())),
      avatar: row.avatar,
      // PostgreSQL returns `HH:mm:ss`.
      reminderTime: row.reminderTime.slice(0, 5),
      reminderEnabled: row.reminderEnabled,
    };
  }

  return {
    async create(parentId: string, input: CreateChildInput): Promise<ChildResponse> {
      assertAgeInRange(input.birthDate);
      return toResponse(await children.insert({ parentId, ...input }));
    },

    async list(parentId: string): Promise<ChildResponse[]> {
      return (await children.listByParent(parentId)).map(toResponse);
    },

    async get(parentId: string, id: string): Promise<ChildResponse> {
      const row = await children.findForParent(parentId, id);
      if (!row) throw childNotFound(id);
      return toResponse(row);
    },

    async update(parentId: string, id: string, input: UpdateChildInput): Promise<ChildResponse> {
      if (input.birthDate !== undefined) assertAgeInRange(input.birthDate);
      const row = await children.updateForParent(parentId, id, input);
      if (!row) throw childNotFound(id);
      return toResponse(row);
    },
  };
}

export type ChildService = ReturnType<typeof createChildService>;
