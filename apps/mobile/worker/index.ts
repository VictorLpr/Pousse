/**
 * Cloudflare Worker for the PWA: serves the static export files and
 * forwards `/api/*` to the API with the prefix stripped. The web app and the
 * API thus share the same origin: no CORS, first-party session cookie.
 *
 * Types are written by hand to avoid depending on
 * `@cloudflare/workers-types`.
 */
interface WorkerEnv {
  readonly ASSETS: { fetch(request: Request): Promise<Response> };
  readonly API_ORIGIN: string;
}

const API_PREFIX = '/api';

/**
 * Header carrying the client IP to the API, read by BetterAuth for rate
 * limiting (`CLIENT_IP_HEADER` in `apps/api/src/modules/auth/auth.ts`).
 * `X-Forwarded-For` can't be used: Cloudflare and the Scaleway proxy each
 * append an address, and BetterAuth ignores a list.
 */
const CLIENT_IP_HEADER = 'X-Client-IP';

function isApiPath(pathname: string): boolean {
  return pathname === API_PREFIX || pathname.startsWith(`${API_PREFIX}/`);
}

function relayToApi(request: Request, apiOrigin: string): Promise<Response> {
  const url = new URL(request.url);
  const target = new URL(url.pathname.slice(API_PREFIX.length) || '/', apiOrigin);
  target.search = url.search;

  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.set('X-Forwarded-Host', url.host);
  headers.set('X-Forwarded-Proto', url.protocol.slice(0, -1));
  // Always overwritten: a value sent by the client must never get through.
  const clientIp = request.headers.get('CF-Connecting-IP');
  if (clientIp) headers.set(CLIENT_IP_HEADER, clientIp);
  else headers.delete(CLIENT_IP_HEADER);

  // The response is returned as is: Set-Cookie headers are left untouched.
  return fetch(target, {
    method: request.method,
    headers,
    body: request.body,
    redirect: 'manual',
  });
}

export default {
  fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const { pathname } = new URL(request.url);
    return isApiPath(pathname) ? relayToApi(request, env.API_ORIGIN) : env.ASSETS.fetch(request);
  },
};
