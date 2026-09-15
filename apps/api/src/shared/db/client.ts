import { drizzle } from 'drizzle-orm/node-postgres';

/**
 * Connexion Drizzle (ADR-0002) sur un pool `pg`. Le pool est exposé via
 * `db.$client` pour être fermé à l'arrêt du serveur.
 */
export function createDbClient(databaseUrl: string) {
  return drizzle({ connection: databaseUrl });
}

export type Db = ReturnType<typeof createDbClient>;
