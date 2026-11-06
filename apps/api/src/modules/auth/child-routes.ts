import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import {
  childParams,
  childResponse,
  consentResponse,
  createChildBody,
  updateChildBody,
} from '#/modules/auth/child-schemas.js';
import type { ChildService } from '#/modules/auth/child-service.js';
import { parentIdOf } from '#/modules/auth/parent-session.js';
import { errorResponse } from '#/shared/errors/error-handler.js';

/**
 * Child profile routes, every one reserved to the signed-in parent: the
 * calling plugin registers the `requireParent` hook. A child of another
 * parent answers 404 `CHILD_NOT_FOUND`.
 */
export function registerChildRoutes(app: FastifyInstance, children: ChildService): void {
  const routes = app.withTypeProvider<ZodTypeProvider>();

  routes.post(
    '/',
    {
      schema: {
        body: createChildBody,
        response: {
          201: childResponse,
          400: errorResponse,
          401: errorResponse,
          422: errorResponse,
        },
      },
    },
    async (request, reply) =>
      reply.code(201).send(await children.create(parentIdOf(request), request.body)),
  );

  routes.get(
    '/',
    { schema: { response: { 200: z.array(childResponse), 401: errorResponse } } },
    async (request) => children.list(parentIdOf(request)),
  );

  routes.get(
    '/:id',
    {
      schema: {
        params: childParams,
        response: {
          200: childResponse,
          400: errorResponse,
          401: errorResponse,
          404: errorResponse,
        },
      },
    },
    async (request) => children.get(parentIdOf(request), request.params.id),
  );

  routes.patch(
    '/:id',
    {
      schema: {
        params: childParams,
        body: updateChildBody,
        response: {
          200: childResponse,
          400: errorResponse,
          401: errorResponse,
          404: errorResponse,
          422: errorResponse,
        },
      },
    },
    async (request) => children.update(parentIdOf(request), request.params.id, request.body),
  );

  // A profile created before consent was required answers 404
  // `CONSENT_NOT_FOUND`.
  routes.get(
    '/:id/consent',
    {
      schema: {
        params: childParams,
        response: {
          200: consentResponse,
          400: errorResponse,
          401: errorResponse,
          404: errorResponse,
        },
      },
    },
    async (request) => children.getConsent(parentIdOf(request), request.params.id),
  );
}
