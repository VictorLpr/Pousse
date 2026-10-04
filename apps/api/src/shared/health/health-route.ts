import { sql } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import type { Db } from '#/shared/db/client.js';

const healthResponse = z.object({
  status: z.enum(['ok', 'degraded']),
  database: z.enum(['ok', 'unreachable']),
});

/**
 * Health probe for the container healthcheck: checks that the process
 * responds and that PostgreSQL is reachable.
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
          return { status: 'ok', database: 'ok' } as const;
        } catch (error) {
          app.log.error(error, 'Database unreachable');
          return reply.code(503).send({ status: 'degraded', database: 'unreachable' });
        }
      },
    );
}
