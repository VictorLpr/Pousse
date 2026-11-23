import {
  createParentAuthClient,
  type AuthClientSetup,
} from '@/modules/auth/infrastructure/http/parent-auth-client';

/**
 * Web: the session cookie is `HttpOnly`, `SameSite=Lax`, set and sent by the
 * browser on same-origin requests, never readable from JavaScript nor written
 * to `localStorage` (ADR-0010).
 */
export function createAuthClientSetup(apiUrl: string | undefined): AuthClientSetup {
  return {
    client: createParentAuthClient(apiUrl),
    sessionCookie: async () => null,
  };
}
