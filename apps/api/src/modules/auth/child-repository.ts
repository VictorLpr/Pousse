import { and, asc, eq } from 'drizzle-orm';

import type { DbExecutor } from '#/shared/db/client.js';
import { child } from '#/shared/db/schema.js';

export type ChildRow = typeof child.$inferSelect;
export type NewChildRow = typeof child.$inferInsert;
export type ChildChanges = Partial<
  Pick<NewChildRow, 'firstName' | 'birthDate' | 'avatar' | 'reminderTime' | 'reminderEnabled'>
>;

/**
 * Data access for `child`. Every read and write is scoped to the parent: a
 * child of another parent is never found, so the service answers 404 rather
 * than 403 and doesn't reveal that the child exists.
 */
export function createChildRepository(db: DbExecutor) {
  return {
    async insert(values: NewChildRow): Promise<ChildRow> {
      const [row] = await db.insert(child).values(values).returning();
      if (!row) throw new Error('Child insert returned no row');
      return row;
    },

    listByParent(parentId: string): Promise<ChildRow[]> {
      return db
        .select()
        .from(child)
        .where(eq(child.parentId, parentId))
        .orderBy(asc(child.createdAt), asc(child.id));
    },

    async findForParent(parentId: string, id: string): Promise<ChildRow | undefined> {
      const [row] = await db
        .select()
        .from(child)
        .where(and(eq(child.id, id), eq(child.parentId, parentId)));
      return row;
    },

    async updateForParent(
      parentId: string,
      id: string,
      changes: ChildChanges,
    ): Promise<ChildRow | undefined> {
      const [row] = await db
        .update(child)
        .set(changes)
        .where(and(eq(child.id, id), eq(child.parentId, parentId)))
        .returning();
      return row;
    },
  };
}

export type ChildRepository = ReturnType<typeof createChildRepository>;
