import type { ChildService } from '#/modules/auth/index.js';
import type { EmotionRepository } from '#/modules/journal/emotion-repository.js';
import type { EntryRepository, EntryRow } from '#/modules/journal/entry-repository.js';
import type {
  CreateEntryInput,
  EntryResponse,
  StreakResponse,
  UpdateEntryInput,
} from '#/modules/journal/entry-schemas.js';
import { countEveningStreak, daysBetween } from '#/modules/journal/streak.js';
import { AppError, ConflictError, NotFoundError, ValidationError } from '#/shared/errors/index.js';

/** How long an entry stays editable after it was written (ADR-0005). */
export const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * How far a local date may be from the UTC date: every time zone's local day
 * is within one day of it.
 */
export const MAX_DAYS_FROM_UTC = 1;

const UNIQUE_ONE_ENTRY_PER_DAY = 'journal_entry_child_id_date_unique';

/** True when `error`, or one of its causes, is that unique constraint's violation. */
function isOneEntryPerDayViolation(error: unknown): boolean {
  for (let current = error; current instanceof Object; current = (current as Error).cause) {
    const { code, constraint } = current as { code?: unknown; constraint?: unknown };
    if (code === '23505' && constraint === UNIQUE_ONE_ENTRY_PER_DAY) return true;
  }
  return false;
}

function toResponse(row: EntryRow): EntryResponse {
  return {
    id: row.id,
    childId: row.childId,
    emotionCode: row.emotionCode,
    text: row.text,
    date: row.date,
    createdAt: row.createdAt.toISOString(),
  };
}

function entryNotFound(id: string): NotFoundError {
  return new NotFoundError('ENTRY_NOT_FOUND', `Journal entry not found: ${id}`);
}

/**
 * The evening journal: one entry per child per day (the database's unique
 * constraint, answered as 409 `ENTRY_ALREADY_EXISTS`), editable for 24 hours
 * (a service rule, ADR-0005), and the streak of evenings counted from it.
 *
 * The local day comes from the client; a date more than a day away from the
 * UTC date can't be anyone's today and is refused. Whether a child belongs
 * to the parent is asked to the auth module's service (ADR-0006).
 */
export function createEntryService(
  {
    entries,
    emotions,
    children,
  }: {
    readonly entries: EntryRepository;
    readonly emotions: EmotionRepository;
    readonly children: ChildService;
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

  async function emotionIdOf(code: string): Promise<number> {
    const id = await emotions.findIdByCode(code);
    if (id === undefined) throw new ValidationError('UNKNOWN_EMOTION', `Unknown emotion: ${code}`);
    return id;
  }

  /** The entry, once its child is known to belong to the parent. */
  async function findOwnEntry(parentId: string, id: string): Promise<EntryRow> {
    const entry = await entries.findById(id);
    if (!entry) throw entryNotFound(id);
    try {
      await children.get(parentId, entry.childId);
    } catch (error) {
      // Another parent's entry: don't reveal that it exists.
      if (error instanceof AppError && error.code === 'CHILD_NOT_FOUND') throw entryNotFound(id);
      throw error;
    }
    return entry;
  }

  async function getEntry(id: string): Promise<EntryResponse> {
    const entry = await entries.findById(id);
    if (!entry) throw entryNotFound(id);
    return toResponse(entry);
  }

  return {
    async create(parentId: string, input: CreateEntryInput): Promise<EntryResponse> {
      await children.get(parentId, input.childId);
      assertNearToday(input.date);
      const emotionId = await emotionIdOf(input.emotionCode);
      try {
        const values = { childId: input.childId, text: input.text, date: input.date };
        const { id, createdAt } = await entries.insert({ ...values, emotionId });
        return toResponse({ id, emotionCode: input.emotionCode, createdAt, ...values });
      } catch (error) {
        if (isOneEntryPerDayViolation(error)) {
          throw new ConflictError(
            'ENTRY_ALREADY_EXISTS',
            `Child ${input.childId} already has a journal entry on ${input.date}`,
          );
        }
        throw error;
      }
    },

    async list(parentId: string, childId: string): Promise<EntryResponse[]> {
      await children.get(parentId, childId);
      return (await entries.listByChild(childId)).map(toResponse);
    },

    async update(parentId: string, id: string, input: UpdateEntryInput): Promise<EntryResponse> {
      const entry = await findOwnEntry(parentId, id);
      if (now().getTime() - entry.createdAt.getTime() >= EDIT_WINDOW_MS) {
        throw new ValidationError(
          'ENTRY_EDIT_WINDOW_CLOSED',
          `Journal entry ${id} can only be edited within 24 hours of its creation`,
        );
      }
      await entries.update(id, {
        text: input.text,
        emotionId:
          input.emotionCode === undefined ? undefined : await emotionIdOf(input.emotionCode),
      });
      return getEntry(id);
    },

    async streak(parentId: string, childId: string, today: string): Promise<StreakResponse> {
      await children.get(parentId, childId);
      assertNearToday(today);
      return { streak: countEveningStreak(await entries.listDatesUpTo(childId, today), today) };
    },
  };
}

export type EntryService = ReturnType<typeof createEntryService>;
