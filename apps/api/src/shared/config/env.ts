import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url(),
});

export interface Env {
  readonly port: number;
  readonly databaseUrl: string;
}

/**
 * Lit et valide les variables d'environnement. Une variable manquante ou
 * invalide fait échouer le démarrage plutôt que la première requête.
 */
export function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.')} : ${issue.message}`)
      .join(', ');
    throw new Error(`Variables d'environnement invalides — ${details}`);
  }
  return { port: result.data.PORT, databaseUrl: result.data.DATABASE_URL };
}
