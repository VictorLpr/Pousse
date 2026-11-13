import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { parentIdOf } from '#/modules/auth/index.js';
import {
  createEntryBody,
  entriesQuery,
  entryParams,
  entryResponse,
  streakQuery,
  streakResponse,
  updateEntryBody,
} from '#/modules/journal/entry-schemas.js';
import type { EntryService } from '#/modules/journal/entry-service.js';
import { errorResponse } from '#/shared/errors/error-handler.js';

/**
 * Journal entry and streak routes, every one reserved to the signed-in
 * parent: the calling plugin registers the `requireParent` hook. A child of
 * another parent answers 404 `CHILD_NOT_FOUND`, an entry of another parent
 * 404 `ENTRY_NOT_FOUND`.
 */
export function registerEntryRoutes(app: FastifyInstance, entries: EntryService): void {
  const routes = app.withTypeProvider<ZodTypeProvider>();

  routes.post(
    '/entries',
    {
      schema: {
        body: createEntryBody,
        response: {
          201: entryResponse,
          400: errorResponse,
          401: errorResponse,
          404: errorResponse,
          409: errorResponse,
          422: errorResponse,
        },
      },
    },
    async (request, reply) =>
      reply.code(201).send(await entries.create(parentIdOf(request), request.body)),
  );

  routes.get(
    '/entries',
    {
      schema: {
        querystring: entriesQuery,
        response: {
          200: z.array(entryResponse),
          400: errorResponse,
          401: errorResponse,
          404: errorResponse,
        },
      },
    },
    async (request) => entries.list(parentIdOf(request), request.query.childId),
  );

  routes.patch(
    '/entries/:id',
    {
      schema: {
        params: entryParams,
        body: updateEntryBody,
        response: {
          200: entryResponse,
          400: errorResponse,
          401: errorResponse,
          404: errorResponse,
          422: errorResponse,
        },
      },
    },
    async (request) => entries.update(parentIdOf(request), request.params.id, request.body),
  );

  routes.get(
    '/streak',
    {
      schema: {
        querystring: streakQuery,
        response: {
          200: streakResponse,
          400: errorResponse,
          401: errorResponse,
          404: errorResponse,
          422: errorResponse,
        },
      },
    },
    async (request) =>
      entries.streak(parentIdOf(request), request.query.childId, request.query.today),
  );
}
