import { eq } from 'drizzle-orm';

import { EMOTIONS } from '#/shared/db/catalogs/emotions.js';
import type { Db } from '#/shared/db/client.js';
import { emotion } from '#/shared/db/schema.js';

/**
 * Fills the catalog tables from `catalogs/`. Idempotent: rows are matched on
 * their stable `code`, missing ones are inserted in catalog order and
 * existing ones get their label updated. It never deletes: a catalog row may
 * be referenced by user data.
 *
 * Not an `insert … on conflict`: PostgreSQL draws an identity value for every
 * row it tries to insert, conflicting or not, and the catalogs' `smallint`
 * ids would run out after enough deploys.
 */
export async function seedCatalogs(db: Db): Promise<void> {
  await db.transaction(async (tx) => {
    const existing = new Map(
      (await tx.select({ code: emotion.code, label: emotion.label }).from(emotion)).map((row) => [
        row.code,
        row.label,
      ]),
    );
    const missing = EMOTIONS.filter((row) => !existing.has(row.code));
    if (missing.length > 0) await tx.insert(emotion).values(missing);
    for (const row of EMOTIONS) {
      const label = existing.get(row.code);
      if (label !== undefined && label !== row.label) {
        await tx.update(emotion).set({ label: row.label }).where(eq(emotion.code, row.code));
      }
    }
  });
}
