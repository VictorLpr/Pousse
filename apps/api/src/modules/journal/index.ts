import type { FastifyInstance } from 'fastify';

import { requireParent, type Auth, type ChildService } from '#/modules/auth/index.js';
import { createEmotionRepository } from '#/modules/journal/emotion-repository.js';
import { registerEmotionRoutes } from '#/modules/journal/emotion-routes.js';
import { createEmotionService } from '#/modules/journal/emotion-service.js';
import { createEntryRepository } from '#/modules/journal/entry-repository.js';
import { registerEntryRoutes } from '#/modules/journal/entry-routes.js';
import { createEntryService } from '#/modules/journal/entry-service.js';
import type { Db } from '#/shared/db/client.js';

export interface JournalModuleOptions {
  readonly db: Db;
  readonly auth: Auth;
  /** The auth module's service, to check that a child belongs to the parent. */
  readonly children: ChildService;
}

/**
 * Journal module: evening ritual, journal entries (business rules detailed
 * in ADR-0005: one memory per day per child, twenty-four-hour edit window),
 * the streak of evenings counted from them, and the emotion catalog it
 * consumes (ADR-0006).
 *
 * The emotion catalog is public; entries and streak are reserved to the
 * signed-in parent.
 */
export async function journalModule(
  app: FastifyInstance,
  { db, auth, children }: JournalModuleOptions,
): Promise<void> {
  const emotions = createEmotionRepository(db);
  registerEmotionRoutes(app, createEmotionService(emotions));

  const entries = createEntryService({ entries: createEntryRepository(db), emotions, children });
  await app.register(async (scope) => {
    scope.decorateRequest('parentId', undefined);
    scope.addHook('onRequest', requireParent(auth));
    registerEntryRoutes(scope, entries);
  });
}
