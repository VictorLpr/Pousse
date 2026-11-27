import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { parentIdOf } from '#/modules/auth/index.js';
import { badgeResponse, badgesQuery } from '#/modules/challenges/badge-schemas.js';
import type { BadgeService } from '#/modules/challenges/badge-service.js';
import { errorResponse } from '#/shared/errors/error-handler.js';

/**
 * Badge routes, reserved to the signed-in parent: the calling plugin
 * registers the `requireParent` hook. A child of another parent answers 404
 * `CHILD_NOT_FOUND`.
 */
export function registerBadgeRoutes(app: FastifyInstance, badges: BadgeService): void {
  const routes = app.withTypeProvider<ZodTypeProvider>();

  routes.get(
    '/badges',
    {
      schema: {
        querystring: badgesQuery,
        response: {
          200: z.array(badgeResponse),
          400: errorResponse,
          401: errorResponse,
          404: errorResponse,
        },
      },
    },
    async (request) => badges.list(parentIdOf(request), request.query.childId),
  );
}
