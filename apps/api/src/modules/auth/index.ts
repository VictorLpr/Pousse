import type { FastifyInstance } from 'fastify';

/**
 * Module auth : comptes parents, sessions, enfants (voir ADR-0003).
 * Encapsulation Fastify : ce plugin ne voit pas les décorateurs des autres
 * modules sauf usage explicite de `fastify-plugin` (ADR-0001).
 *
 * À implémenter : montage de BetterAuth, routes CRUD enfant.
 */
export async function authModule(_app: FastifyInstance): Promise<void> {
  // Routes à venir.
}
