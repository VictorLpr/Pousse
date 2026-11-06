import { asc } from 'drizzle-orm';

import type { Db } from '#/shared/db/client.js';
import { emotion } from '#/shared/db/schema.js';

export interface EmotionRow {
  readonly code: string;
  readonly label: string;
}

export interface EmotionRepository {
  /** Every emotion of the catalog, in seed order. */
  listAll(): Promise<EmotionRow[]>;
}

export function createEmotionRepository(db: Db): EmotionRepository {
  return {
    listAll: () =>
      db
        .select({ code: emotion.code, label: emotion.label })
        .from(emotion)
        .orderBy(asc(emotion.id)),
  };
}
