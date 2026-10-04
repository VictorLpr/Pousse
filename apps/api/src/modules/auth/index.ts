import type { FastifyInstance } from 'fastify';

import type { Auth } from '#/modules/auth/auth.js';
import { registerAuthRoute } from '#/modules/auth/auth-route.js';

export { AUTH_BASE_PATH, createAuth, type Auth, type AuthConfig } from '#/modules/auth/auth.js';

export interface AuthModuleOptions {
  readonly auth: Auth;
  /** Public origin of the application, without a path. */
  readonly baseUrl: string;
}

/**
 * Auth module: parent accounts, sessions, children (see ADR-0003).
 * Fastify encapsulation: this plugin doesn't see other modules' decorators
 * unless `fastify-plugin` is used explicitly (ADR-0001).
 *
 * To implement: child CRUD routes.
 */
export async function authModule(
  app: FastifyInstance,
  { auth, baseUrl }: AuthModuleOptions,
): Promise<void> {
  // Child plugin: body parsing is disabled for BetterAuth and must not apply
  // to the module's future business routes.
  await app.register(async (scope) => {
    registerAuthRoute(scope, auth, baseUrl);
  });
}
