import { eq } from 'drizzle-orm';

import { CHALLENGES } from '#/shared/db/catalogs/challenges.js';
import { EMOTIONS } from '#/shared/db/catalogs/emotions.js';
import type { Db } from '#/shared/db/client.js';
import { challenge, emotion } from '#/shared/db/schema.js';

type Transaction = Parameters<Parameters<Db['transaction']>[0]>[0];

/**
 * Fills the catalog tables from `catalogs/`. Idempotent: rows are matched on
 * their stable `code`, missing ones are inserted in catalog order and
 * existing ones get their content updated. It never deletes: a catalog row
 * may be referenced by user data.
 *
 * Not an `insert … on conflict`: PostgreSQL draws an identity value for every
 * row it tries to insert, conflicting or not, and the catalogs' `smallint`
 * ids would run out after enough deploys.
 */
export async function seedCatalogs(db: Db): Promise<void> {
  await db.transaction(async (tx) => {
    await seedEmotions(tx);
    await seedChallenges(tx);
  });
}

async function seedEmotions(tx: Transaction): Promise<void> {
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
}

/**
 * Also carries `active`: retiring a challenge is done in the catalog file,
 * so it ships with a deploy like any other catalog change.
 */
async function seedChallenges(tx: Transaction): Promise<void> {
  const existing = new Map(
    (
      await tx
        .select({
          code: challenge.code,
          title: challenge.title,
          description: challenge.description,
          ageRange: challenge.ageRange,
          category: challenge.category,
          active: challenge.active,
        })
        .from(challenge)
    ).map((row) => [row.code, row]),
  );
  const missing = CHALLENGES.filter((row) => !existing.has(row.code));
  if (missing.length > 0) await tx.insert(challenge).values(missing);
  for (const row of CHALLENGES) {
    const current = existing.get(row.code);
    if (current === undefined) continue;
    const wanted = {
      title: row.title,
      description: row.description,
      ageRange: row.ageRange,
      category: row.category,
      active: row.active ?? true,
    };
    const changed = (Object.keys(wanted) as (keyof typeof wanted)[]).some(
      (key) => current[key] !== wanted[key],
    );
    if (changed) await tx.update(challenge).set(wanted).where(eq(challenge.code, row.code));
  }
}
