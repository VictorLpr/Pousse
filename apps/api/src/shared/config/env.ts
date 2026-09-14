/**
 * Lecture des variables d'environnement. Placeholder : le schéma de
 * validation (Zod) sera ajouté au démarrage du chantier API.
 */
export interface Env {
  readonly port: number;
  readonly databaseUrl: string;
}

export function loadEnv(): Env {
  const port = Number(process.env.PORT ?? 3000);
  const databaseUrl = process.env.DATABASE_URL ?? '';
  return { port, databaseUrl };
}
