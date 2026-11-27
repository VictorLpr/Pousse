import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';

import { parentIdOf } from '#/modules/auth/index.js';
import {
  childChallengeParams,
  childChallengeResponse,
  weekQuery,
  weekResponse,
} from '#/modules/challenges/challenge-schemas.js';
import type { ChallengeService } from '#/modules/challenges/challenge-service.js';
import { errorResponse } from '#/shared/errors/error-handler.js';

/**
 * Weekly challenge routes, every one reserved to the signed-in parent: the
 * calling plugin registers the `requireParent` hook. A child of another
 * parent answers 404 `CHILD_NOT_FOUND`, a challenge of another parent 404
 * `CHILD_CHALLENGE_NOT_FOUND`.
 */
export function registerChallengeRoutes(app: FastifyInstance, challenges: ChallengeService): void {
  const routes = app.withTypeProvider<ZodTypeProvider>();

  routes.get(
    '/week',
    {
      schema: {
        querystring: weekQuery,
        response: {
          200: weekResponse,
          400: errorResponse,
          401: errorResponse,
          404: errorResponse,
          422: errorResponse,
        },
      },
    },
    async (request) =>
      challenges.week(parentIdOf(request), request.query.childId, request.query.today),
  );

  const transitionSchema = {
    params: childChallengeParams,
    response: {
      200: childChallengeResponse,
      400: errorResponse,
      401: errorResponse,
      404: errorResponse,
      409: errorResponse,
    },
  };

  routes.post('/:id/choose', { schema: transitionSchema }, async (request) =>
    challenges.choose(parentIdOf(request), request.params.id),
  );

  routes.post('/:id/complete', { schema: transitionSchema }, async (request) =>
    challenges.complete(parentIdOf(request), request.params.id),
  );
}
