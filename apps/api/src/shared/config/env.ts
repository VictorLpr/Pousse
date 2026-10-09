import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url(),
  /** Session cookie signing key (`openssl rand -base64 32`). */
  BETTER_AUTH_SECRET: z.string().min(32, 'must be at least 32 characters'),
  /**
   * Public origin of the application (no path), e.g.
   * `https://pousse-staging.example.workers.dev`. Used to check the `Origin`
   * header of auth requests and to set `Secure` cookies over HTTPS.
   */
  BETTER_AUTH_URL: z
    .string()
    .url()
    .refine((value) => new URL(value).pathname === '/', 'must be an origin without a path'),
});

export interface Env {
  readonly port: number;
  readonly databaseUrl: string;
  readonly betterAuthSecret: string;
  readonly betterAuthUrl: string;
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
  return {
    port: result.data.PORT,
    databaseUrl: result.data.DATABASE_URL,
    betterAuthSecret: result.data.BETTER_AUTH_SECRET,
    betterAuthUrl: new URL(result.data.BETTER_AUTH_URL).origin,
  };
}
