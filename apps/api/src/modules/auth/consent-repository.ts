import { eq } from 'drizzle-orm';

import type { DbExecutor } from '#/shared/db/client.js';
import { consent } from '#/shared/db/schema.js';

export type ConsentRow = typeof consent.$inferSelect;
export type NewConsentRow = typeof consent.$inferInsert;

/**
 * Data access for `consent`, the proof of parental consent. Insert and read
 * only: a consent is never updated, and this repository is the guarantee
 * (ADR-0005). Don't add an update method; a new policy version means a new
 * proof, not an edited one.
 */
export function createConsentRepository(db: DbExecutor) {
  return {
    async insert(values: NewConsentRow): Promise<ConsentRow> {
      const [row] = await db.insert(consent).values(values).returning();
      if (!row) throw new Error('Consent insert returned no row');
      return row;
    },

    async findByChild(childId: string): Promise<ConsentRow | undefined> {
      const [row] = await db.select().from(consent).where(eq(consent.childId, childId));
      return row;
    },
  };
}

export type ConsentRepository = ReturnType<typeof createConsentRepository>;
