import { and, desc, eq, lte } from 'drizzle-orm';

import { createPhotoRepository, type PhotoRow } from '#/modules/journal/photo-repository.js';
import type { DbExecutor } from '#/shared/db/client.js';
import { emotion, journalEntry, photo } from '#/shared/db/schema.js';

export type NewEntryRow = Pick<
  typeof journalEntry.$inferInsert,
  'childId' | 'emotionId' | 'text' | 'date'
>;
export type EntryChanges = Partial<Pick<NewEntryRow, 'emotionId' | 'text'>>;

/** A journal entry with its emotion's code and its photo, if any. */
export interface EntryRow {
  readonly id: string;
  readonly childId: string;
  readonly emotionCode: string;
  readonly text: string;
  readonly date: string;
  readonly createdAt: Date;
  readonly photo: PhotoRow | null;
}

const entryColumns = {
  id: journalEntry.id,
  childId: journalEntry.childId,
  emotionCode: emotion.code,
  text: journalEntry.text,
  date: journalEntry.date,
  createdAt: journalEntry.createdAt,
  // Drizzle answers `null` for the whole object when the left join finds no photo.
  photo: { fileName: photo.fileName, mimeType: photo.mimeType },
};

/**
 * Data access for `journal_entry` and, through the photo repository, the
 * entry's photo. It never reads `child`: whether a child belongs to the
 * parent is the auth module's service to answer (ADR-0006).
 */
export function createEntryRepository(db: DbExecutor) {
  function selectEntries() {
    return db
      .select(entryColumns)
      .from(journalEntry)
      .innerJoin(emotion, eq(journalEntry.emotionId, emotion.id))
      .leftJoin(photo, eq(photo.journalEntryId, journalEntry.id));
  }

  return {
    /**
     * Writes the entry and its photo, if any, together. Throws the
     * database's unique violation on a second entry the same day. The insert
     * runs in its own transaction (a savepoint when `db` already is one), so
     * the violation doesn't abort the caller's transaction.
     */
    insert(
      values: NewEntryRow,
      entryPhoto: PhotoRow | null,
    ): Promise<{ id: string; createdAt: Date }> {
      return db.transaction(async (tx) => {
        const [row] = await tx
          .insert(journalEntry)
          .values(values)
          .returning({ id: journalEntry.id, createdAt: journalEntry.createdAt });
        if (!row) throw new Error('Journal entry insert returned no row');
        if (entryPhoto) await createPhotoRepository(tx).save(row.id, entryPhoto);
        return row;
      });
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

    /**
     * Changes the entry, then its photo: a photo adds or replaces the current
     * one, `null` removes it, `undefined` leaves it as it is. Both in one
     * transaction.
     */
    async update(
      id: string,
      changes: EntryChanges,
      entryPhoto: PhotoRow | null | undefined,
    ): Promise<void> {
      await db.transaction(async (tx) => {
        // `updated_at` spelled out: when only the photo changes, every other
        // field is undefined and Drizzle refuses an empty `set()`.
        await tx
          .update(journalEntry)
          .set({ ...changes, updatedAt: new Date() })
          .where(eq(journalEntry.id, id));
        const photos = createPhotoRepository(tx);
        if (entryPhoto === null) await photos.remove(id);
        else if (entryPhoto) await photos.save(id, entryPhoto);
      });
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
