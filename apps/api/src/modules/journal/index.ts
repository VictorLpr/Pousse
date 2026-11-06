import type { FastifyInstance } from 'fastify';

import { createEmotionRepository } from '#/modules/journal/emotion-repository.js';
import { registerEmotionRoutes } from '#/modules/journal/emotion-routes.js';
import { createEmotionService } from '#/modules/journal/emotion-service.js';
import type { Db } from '#/shared/db/client.js';

export interface JournalModuleOptions {
  readonly db: Db;
}

/**
 * Journal module: evening ritual, journal entries (business rules detailed
 * in ADR-0005: one memory per day per child, twenty-four-hour edit window),
 * and the emotion catalog it consumes (ADR-0006).
 *
 * To implement: routes to create/read entries.
 */
export async function journalModule(
  app: FastifyInstance,
  { db }: JournalModuleOptions,
): Promise<void> {
  registerEmotionRoutes(app, createEmotionService(createEmotionRepository(db)));
}
