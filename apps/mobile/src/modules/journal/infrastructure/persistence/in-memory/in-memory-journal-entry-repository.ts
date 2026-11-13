import type { Emotion } from '@/modules/journal/domain/entities/emotion';
import {
  JOURNAL_TEXT_MAX_LENGTH,
  type JournalEntry,
  type NewJournalEntry,
} from '@/modules/journal/domain/entities/journal-entry';
import { PHOTO_MIME_TYPES, type EntryPhoto } from '@/modules/journal/domain/entities/photo';
import { JournalError } from '@/modules/journal/domain/errors/journal-error';
import type { JournalEntryRepository } from '@/modules/journal/domain/ports/journal-entry-repository';
import type { IdGenerator } from '@/shared/infrastructure/ids/id-generator';
import {
  daysBetween,
  isCalendarDate,
  previousDay,
  utcDay,
} from '@/shared/infrastructure/time/calendar-day';
import type { Clock } from '@/shared/infrastructure/time/clock';

/** The API refuses a day further than this from its UTC date: it can't be anyone's today. */
const MAX_DAYS_FROM_UTC = 1;
const PHOTO_FILE_NAME_MAX_LENGTH = 255;

/**
 * Fake journal API (`/journal/entries`, `/journal/streak`): same rules,
 * codes and English messages. The family's local day always comes from the
 * client; the clock only bounds it and stamps `createdAt`.
 */
export class InMemoryJournalEntryRepository implements JournalEntryRepository {
  private readonly entriesById = new Map<string, JournalEntry>();

  constructor(
    seed: readonly JournalEntry[],
    private readonly emotions: readonly Emotion[],
    /** Whether the child exists: the API asks the auth module (ADR-0006). */
    private readonly childExists: (childId: string) => Promise<boolean>,
    private readonly idGenerator: IdGenerator,
    private readonly clock: Clock,
  ) {
    seed.forEach((entry) => this.entriesById.set(entry.id, entry));
  }

  async findByChildId(childId: string): Promise<JournalEntry[]> {
    await this.assertChildExists(childId);
    return this.entriesOf(childId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async create(newEntry: NewJournalEntry): Promise<JournalEntry> {
    const text = newEntry.text.trim();
    this.assertValidInput({ ...newEntry, text });
    await this.assertChildExists(newEntry.childId);
    this.assertNearToday(newEntry.date);
    if (!this.emotions.some((emotion) => emotion.code === newEntry.emotionCode)) {
      throw new JournalError('UNKNOWN_EMOTION', `Unknown emotion: ${newEntry.emotionCode}`);
    }
    if (this.entriesOf(newEntry.childId).some((entry) => entry.date === newEntry.date)) {
      throw new JournalError(
        'ENTRY_ALREADY_EXISTS',
        `Child ${newEntry.childId} already has a journal entry on ${newEntry.date}`,
      );
    }

    const entry: JournalEntry = {
      ...newEntry,
      text,
      id: this.idGenerator.next(),
      createdAt: this.clock.now(),
    };
    this.entriesById.set(entry.id, entry);
    return entry;
  }

  async countEveningStreak(childId: string, today: string): Promise<number> {
    if (!isCalendarDate(today)) {
      throw new JournalError('VALIDATION_FAILED', `Invalid day: ${today}`);
    }
    await this.assertChildExists(childId);
    this.assertNearToday(today);

    const daysWithEntry = new Set(
      this.entriesOf(childId)
        .map((entry) => entry.date)
        .filter((date) => date <= today),
    );
    let cursor = daysWithEntry.has(today) ? today : previousDay(today);
    let streak = 0;
    while (daysWithEntry.has(cursor)) {
      streak += 1;
      cursor = previousDay(cursor);
    }
    return streak;
  }

  private entriesOf(childId: string): JournalEntry[] {
    return [...this.entriesById.values()].filter((entry) => entry.childId === childId);
  }

  /** The request body's checks, answered 400 `VALIDATION_FAILED` by the API. */
  private assertValidInput({ text, date, photo }: NewJournalEntry): void {
    if (text.length === 0 || text.length > JOURNAL_TEXT_MAX_LENGTH) {
      throw new JournalError(
        'VALIDATION_FAILED',
        `Text must be 1 to ${JOURNAL_TEXT_MAX_LENGTH} characters`,
      );
    }
    if (!isCalendarDate(date)) {
      throw new JournalError('VALIDATION_FAILED', `Invalid date: ${date}`);
    }
    if (photo) {
      this.assertValidPhoto(photo);
    }
  }

  private assertValidPhoto({ fileName, mimeType }: EntryPhoto): void {
    if (
      fileName.length === 0 ||
      fileName.length > PHOTO_FILE_NAME_MAX_LENGTH ||
      /[/\\]/.test(fileName)
    ) {
      throw new JournalError(
        'VALIDATION_FAILED',
        'A photo file name, not a path: 1 to 255 characters, no slash nor backslash',
      );
    }
    if (!PHOTO_MIME_TYPES.includes(mimeType)) {
      throw new JournalError('VALIDATION_FAILED', `Photo type not allowed: ${mimeType}`);
    }
  }

  private async assertChildExists(childId: string): Promise<void> {
    if (!(await this.childExists(childId))) {
      throw new JournalError('CHILD_NOT_FOUND', `Child not found: ${childId}`);
    }
  }

  private assertNearToday(date: string): void {
    const utcToday = utcDay(this.clock.now());
    if (Math.abs(daysBetween(utcToday, date)) > MAX_DAYS_FROM_UTC) {
      throw new JournalError(
        'DATE_OUT_OF_RANGE',
        `Date ${date} is more than ${MAX_DAYS_FROM_UTC} day away from ${utcToday} (UTC)`,
      );
    }
  }
}
