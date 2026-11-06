import { drizzle } from 'drizzle-orm/node-postgres';

import { relations } from '#/shared/db/schema.js';

/**
 * Drizzle connection (ADR-0002) on a `pg` pool. The pool is exposed through
 * `db.$client` so it can be closed when the server stops.
 */
export function createDbClient(databaseUrl: string) {
  return drizzle({ connection: databaseUrl, relations });
}

export type Db = ReturnType<typeof createDbClient>;

/** The pool or a transaction opened on it: what a repository runs its queries on. */
export type DbExecutor = Db | Parameters<Parameters<Db['transaction']>[0]>[0];
