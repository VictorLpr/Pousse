import type { FastifyInstance } from 'fastify';

/**
 * Auth module: parent accounts, sessions, children (see ADR-0003).
 * Fastify encapsulation: this plugin doesn't see other modules' decorators
 * unless `fastify-plugin` is used explicitly (ADR-0001).
 *
 * To implement: BetterAuth mounting, child CRUD routes.
 */
export async function authModule(_app: FastifyInstance): Promise<void> {
  // Routes to come.
}
