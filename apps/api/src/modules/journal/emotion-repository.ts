import { asc, eq } from 'drizzle-orm';

import type { Db } from '#/shared/db/client.js';
import { emotion } from '#/shared/db/schema.js';

export interface EmotionRow {
  readonly code: string;
  readonly label: string;
}

export interface EmotionRepository {
  /** Every emotion of the catalog, in seed order. */
  listAll(): Promise<EmotionRow[]>;
  /** Id of the emotion with this code, `undefined` when the catalog has none. */
  findIdByCode(code: string): Promise<number | undefined>;
}

export function createEmotionRepository(db: Db): EmotionRepository {
  return {
    async findIdByCode(code) {
      const [row] = await db.select({ id: emotion.id }).from(emotion).where(eq(emotion.code, code));
      return row?.id;
    },
    listAll: () =>
      db
        .select({ code: emotion.code, label: emotion.label })
        .from(emotion)
        .orderBy(asc(emotion.id)),
  };
}
