import { z } from 'zod';

import { createDbClient } from '#/shared/db/client.js';
import { seedCatalogs } from '#/shared/db/seed-catalogs.js';

/**
 * `npm run db:seed`: fills the catalogs of the database at `DATABASE_URL`.
 * Runs after `db:migrate`, wherever migrations run (compose, deploy
 * workflows).
 */
const databaseUrl = z.string().url().parse(process.env.DATABASE_URL);
const db = createDbClient(databaseUrl);

seedCatalogs(db)
  .then(() => console.log('Catalogs seeded.'))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$client.end());
