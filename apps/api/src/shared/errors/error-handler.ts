import type { FastifyError, FastifyInstance } from 'fastify';
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { AppError } from '#/shared/errors/index.js';

/** Body of every error response of the business routes. */
export const errorResponse = z.object({
  code: z.string(),
  message: z.string(),
});

/**
 * Turns every error thrown by a business route into `{ code, message }`
 * (stable English code, English message; the mobile client maps the code to
 * its own copy). The BetterAuth route answers on its own and never gets here.
 */
export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error instanceof AppError) {
      return reply.code(error.statusCode).send({ code: error.code, message: error.message });
    }
    if (hasZodFastifySchemaValidationErrors(error)) {
      return reply.code(400).send({ code: 'VALIDATION_FAILED', message: error.message });
    }
    // Other client errors raised by Fastify itself (malformed JSON, payload
    // too large…) keep their status and code.
    if (error.statusCode !== undefined && error.statusCode >= 400 && error.statusCode < 500) {
      return reply.code(error.statusCode).send({ code: error.code, message: error.message });
    }
    request.log.error(error);
    return reply.code(500).send({ code: 'INTERNAL_ERROR', message: 'Internal server error' });
  });
}
