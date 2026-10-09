import { defineConfig } from 'drizzle-kit';

/** drizzle-kit configuration (ADR-0002): migrations are generated in `drizzle/`. */
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/shared/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
});
