import { and, desc, eq, lte } from 'drizzle-orm';

import type { DbExecutor } from '#/shared/db/client.js';
import { emotion, journalEntry } from '#/shared/db/schema.js';

export type NewEntryRow = Pick<
  typeof journalEntry.$inferInsert,
  'childId' | 'emotionId' | 'text' | 'date'
>;
export type EntryChanges = Partial<Pick<NewEntryRow, 'emotionId' | 'text'>>;

/** A journal entry with its emotion's code. */
export interface EntryRow {
  readonly id: string;
  readonly childId: string;
  readonly emotionCode: string;
  readonly text: string;
  readonly date: string;
  readonly createdAt: Date;
}

const entryColumns = {
  id: journalEntry.id,
  childId: journalEntry.childId,
  emotionCode: emotion.code,
  text: journalEntry.text,
  date: journalEntry.date,
  createdAt: journalEntry.createdAt,
};

/**
 * Data access for `journal_entry`. It never reads `child`: whether a child
 * belongs to the parent is the auth module's service to answer (ADR-0006).
 */
export function createEntryRepository(db: DbExecutor) {
  function selectEntries() {
    return db
      .select(entryColumns)
      .from(journalEntry)
      .innerJoin(emotion, eq(journalEntry.emotionId, emotion.id));
  }

  return {
    /**
     * Throws the database's unique violation on a second entry the same day.
     * The insert runs in its own transaction (a savepoint when `db` already
     * is one), so the violation doesn't abort the caller's transaction.
     */
    async insert(values: NewEntryRow): Promise<{ id: string; createdAt: Date }> {
      const [row] = await db.transaction((tx) =>
        tx
          .insert(journalEntry)
          .values(values)
          .returning({ id: journalEntry.id, createdAt: journalEntry.createdAt }),
      );
      if (!row) throw new Error('Journal entry insert returned no row');
      return row;
    },

    async findById(id: string): Promise<EntryRow | undefined> {
      const [row] = await selectEntries().where(eq(journalEntry.id, id));
      return row;
    },

    /** A child's entries, newest day first. */
    listByChild(childId: string): Promise<EntryRow[]> {
      return selectEntries()
        .where(eq(journalEntry.childId, childId))
        .orderBy(desc(journalEntry.date));
    },

    async update(id: string, changes: EntryChanges): Promise<void> {
      await db.update(journalEntry).set(changes).where(eq(journalEntry.id, id));
    },

    /** Days a child has an entry on, up to `lastDay`, in no particular order. */
    async listDatesUpTo(childId: string, lastDay: string): Promise<string[]> {
      const rows = await db
        .select({ date: journalEntry.date })
        .from(journalEntry)
        .where(and(eq(journalEntry.childId, childId), lte(journalEntry.date, lastDay)));
      return rows.map(({ date }) => date);
    },
  };
}

export type EntryRepository = ReturnType<typeof createEntryRepository>;
