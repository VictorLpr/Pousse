import { fromNodeHeaders } from 'better-auth/node';
import type { FastifyRequest, onRequestAsyncHookHandler } from 'fastify';

import type { Auth } from '#/modules/auth/auth.js';
import { UnauthorizedError } from '#/shared/errors/index.js';

declare module 'fastify' {
  interface FastifyRequest {
    /** Id of the signed-in parent (`user.id`), set by `requireParent`. */
    parentId: string | undefined;
  }
}

/**
 * `onRequest` hook for the business routes: reads the BetterAuth session
 * from the request's cookie (ADR-0003) and sets `request.parentId`, or
 * answers 401 `UNAUTHORIZED` before the body is even validated. Register it
 * in an encapsulated plugin, after `decorateRequest('parentId', undefined)`.
 */
export function requireParent(auth: Auth): onRequestAsyncHookHandler {
  return async (request) => {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
    if (!session) throw new UnauthorizedError();
    request.parentId = session.user.id;
  };
}

/** The parent id set by `requireParent`; fails loudly if the hook is missing. */
export function parentIdOf(request: FastifyRequest): string {
  if (request.parentId === undefined) throw new Error('requireParent hook is not registered');
  return request.parentId;
}
