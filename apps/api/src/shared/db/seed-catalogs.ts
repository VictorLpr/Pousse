import { EMOTIONS } from '#/shared/db/catalogs/emotions.js';
import type { Db } from '#/shared/db/client.js';
import { emotion } from '#/shared/db/schema.js';

/**
 * Fills the catalog tables from `catalogs/`. Idempotent: each row is
 * upserted on its stable `code`, so running it again only updates the
 * labels. It never deletes: a catalog row may be referenced by user data.
 */
export async function seedCatalogs(db: Db): Promise<void> {
  await db.transaction(async (tx) => {
    for (const row of EMOTIONS) {
      await tx
        .insert(emotion)
        .values(row)
        .onConflictDoUpdate({ target: emotion.code, set: { label: row.label } });
    }
  });
}
