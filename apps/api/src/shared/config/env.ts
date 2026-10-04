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
 * Reads and validates environment variables. A missing or invalid variable
 * fails at startup rather than on the first request.
 */
export function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ');
    throw new Error(`Invalid environment variables — ${details}`);
  }
  return { port: result.data.PORT, databaseUrl: result.data.DATABASE_URL };
}
