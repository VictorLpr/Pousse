import { defineConfig } from 'drizzle-kit';

/** Configuration drizzle-kit (ADR-0002) : migrations générées dans `drizzle/`. */
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/shared/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
});
