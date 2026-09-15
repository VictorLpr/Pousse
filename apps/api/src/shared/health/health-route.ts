import { sql } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import type { Db } from '#/shared/db/client.js';

const healthResponse = z.object({
  statut: z.enum(['ok', 'degrade']),
  base: z.enum(['ok', 'injoignable']),
});

/**
 * Sonde de santé pour le healthcheck du conteneur : vérifie que le processus
 * répond et que PostgreSQL est joignable.
 */
export function registerHealthRoute(app: FastifyInstance, db: Db): void {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get(
      '/health',
      { schema: { response: { 200: healthResponse, 503: healthResponse } } },
      async (_request, reply) => {
        try {
          await db.execute(sql`select 1`);
          return { statut: 'ok', base: 'ok' } as const;
        } catch (error) {
          app.log.error(error, 'Base de données injoignable');
          return reply.code(503).send({ statut: 'degrade', base: 'injoignable' });
        }
      },
    );
}
