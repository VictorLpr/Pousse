import type { FastifyInstance } from 'fastify';

/**
 * Memories module: browsing the memory gallery. Photos themselves never go
 * through the server (ADR-0004); this module only serves metadata (text,
 * emotion, whether a photo exists).
 *
 * To implement: read route, consumed by the mobile gallery.
 */
export async function memoriesModule(_app: FastifyInstance): Promise<void> {
  // Routes to come.
}
