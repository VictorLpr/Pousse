import { drizzle } from 'drizzle-orm/node-postgres';

/**
 * Drizzle connection (ADR-0002) on a `pg` pool. The pool is exposed through
 * `db.$client` so it can be closed when the server stops.
 */
export function createDbClient(databaseUrl: string) {
  return drizzle({ connection: databaseUrl });
}

export type Db = ReturnType<typeof createDbClient>;
