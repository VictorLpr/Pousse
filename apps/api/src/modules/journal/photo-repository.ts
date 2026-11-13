import { eq } from 'drizzle-orm';

import type { DbExecutor } from '#/shared/db/client.js';
import { photo } from '#/shared/db/schema.js';

/** What the API keeps of an entry's photo: the picture never leaves the device (ADR-0004). */
export type PhotoRow = Pick<typeof photo.$inferSelect, 'fileName' | 'mimeType'>;

/**
 * Data access for `photo`, at most one per journal entry. The entry
 * repository creates it on its own transaction, so an entry and its photo
 * are written together.
 */
export function createPhotoRepository(db: DbExecutor) {
  return {
    /** Adds the entry's photo, or replaces the one it has. */
    async save(journalEntryId: string, values: PhotoRow): Promise<void> {
      await db
        .insert(photo)
        .values({ journalEntryId, ...values })
        .onConflictDoUpdate({ target: photo.journalEntryId, set: values });
    },

    async remove(journalEntryId: string): Promise<void> {
      await db.delete(photo).where(eq(photo.journalEntryId, journalEntryId));
    },
  };
}
