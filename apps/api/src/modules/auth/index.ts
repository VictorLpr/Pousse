import type { FastifyInstance } from 'fastify';

import { AUTH_BASE_PATH, type Auth } from '#/modules/auth/auth.js';
import { registerAuthRoute } from '#/modules/auth/auth-route.js';
import { registerChildRoutes } from '#/modules/auth/child-routes.js';
import { createChildService } from '#/modules/auth/child-service.js';
import { requireParent } from '#/modules/auth/parent-session.js';
import type { Db } from '#/shared/db/client.js';

export { AUTH_BASE_PATH, createAuth, type Auth, type AuthConfig } from '#/modules/auth/auth.js';

export interface AuthModuleOptions {
  readonly db: Db;
  readonly auth: Auth;
  /** Public origin of the application, without a path. */
  readonly baseUrl: string;
}

/**
 * Auth module: parent accounts, sessions, children (see ADR-0003).
 * Fastify encapsulation: this plugin doesn't see other modules' decorators
 * unless `fastify-plugin` is used explicitly (ADR-0001).
 *
 * Registered without a prefix: BetterAuth answers under `/auth`, the child
 * profiles under `/children`.
 */
export async function authModule(
  app: FastifyInstance,
  { db, auth, baseUrl }: AuthModuleOptions,
): Promise<void> {
  // Child plugin: body parsing is disabled for BetterAuth and must not apply
  // to the module's business routes.
  await app.register(
    async (scope) => {
      registerAuthRoute(scope, auth, baseUrl);
    },
    { prefix: AUTH_BASE_PATH },
  );

  const children = createChildService(db);
  await app.register(
    async (scope) => {
      scope.decorateRequest('parentId', undefined);
      scope.addHook('onRequest', requireParent(auth));
      registerChildRoutes(scope, children);
    },
    { prefix: '/children' },
  );
}
