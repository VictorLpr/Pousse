/**
 * Worker Cloudflare de la PWA : sert les fichiers de l'export statique et
 * relaie `/api/*` vers l'API, préfixe retiré. Le web et l'API partagent ainsi
 * la même origine : pas de CORS, cookie de session propriétaire.
 *
 * Les types sont écrits à la main pour ne pas dépendre de
 * `@cloudflare/workers-types`.
 */
interface WorkerEnv {
  readonly ASSETS: { fetch(request: Request): Promise<Response> };
  readonly API_ORIGIN: string;
}

const API_PREFIX = '/api';

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

  // La réponse est renvoyée telle quelle : les Set-Cookie ne sont pas touchés.
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
