import type { FastifyInstance } from 'fastify';

import { requireParent, type Auth, type ChildService } from '#/modules/auth/index.js';
import { createChallengeRepository } from '#/modules/challenges/challenge-repository.js';
import { registerChallengeRoutes } from '#/modules/challenges/challenge-routes.js';
import { createChallengeService } from '#/modules/challenges/challenge-service.js';
import type { Db } from '#/shared/db/client.js';

export interface ChallengesModuleOptions {
  readonly db: Db;
  readonly auth: Auth;
  /** The auth module's service, to check that a child belongs to the parent and read its age range. */
  readonly children: ChildService;
}

/**
 * Challenges module: the weekly draw of three challenges per child, the one
 * the child takes on, its completion (ADR-0005), and later the badges it
 * consumes (ADR-0006). Every route is reserved to the signed-in parent.
 */
export async function challengesModule(
  app: FastifyInstance,
  { db, auth, children }: ChallengesModuleOptions,
): Promise<void> {
  const challenges = createChallengeService({
    challenges: createChallengeRepository(db),
    children,
  });
  await app.register(async (scope) => {
    scope.decorateRequest('parentId', undefined);
    scope.addHook('onRequest', requireParent(auth));
    registerChallengeRoutes(scope, challenges);
  });
}
