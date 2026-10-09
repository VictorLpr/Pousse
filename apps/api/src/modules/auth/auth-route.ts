import type { FastifyInstance, FastifyRequest } from 'fastify';

import type { Auth } from '#/modules/auth/auth.js';

/** Headers that Fastify recomputes or that are handled separately. */
const SKIPPED_HEADERS = new Set(['content-length', 'set-cookie', 'transfer-encoding']);

function toWebRequest(request: FastifyRequest, baseUrl: string): Request {
  const headers = new Headers();
  for (const [name, value] of Object.entries(request.headers)) {
    if (value === undefined) continue;
    for (const item of Array.isArray(value) ? value : [value]) headers.append(name, item);
  }
  const body =
    Buffer.isBuffer(request.body) && request.body.length > 0
      ? new Uint8Array(request.body)
      : undefined;
  return new Request(new URL(request.url, baseUrl), {
    method: request.method,
    headers,
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : body,
  });
}

/**
 * Forwards every `/auth/*` request to BetterAuth's Web Fetch handler
 * (ADR-0003). Three requirements set by the ADR:
 *
 * - body parsing is disabled: the body is passed through raw and BetterAuth
 *   validates it itself;
 * - **every** `Set-Cookie` header is copied, not just the first one;
 * - the route is mounted as a wildcard.
 *
 * Deliberate exception to the "every route declares a Zod response schema"
 * rule: responses are produced and validated by BetterAuth.
 */
export function registerAuthRoute(app: FastifyInstance, auth: Auth, baseUrl: string): void {
  // Scoped to this encapsulated plugin: other modules keep Fastify's JSON
  // parsing.
  app.removeAllContentTypeParsers();
  app.addContentTypeParser('*', { parseAs: 'buffer' }, (_request, body, done) => {
    done(null, body);
  });

  app.route({
    method: ['GET', 'POST'],
    url: '/*',
    handler: async (request, reply) => {
      const response = await auth.handler(toWebRequest(request, baseUrl));

      reply.status(response.status);
      response.headers.forEach((value, name) => {
        if (!SKIPPED_HEADERS.has(name)) reply.header(name, value);
      });
      const cookies = response.headers.getSetCookie();
      if (cookies.length > 0) reply.header('set-cookie', cookies);

      return reply.send(await response.text());
    },
  });
}
