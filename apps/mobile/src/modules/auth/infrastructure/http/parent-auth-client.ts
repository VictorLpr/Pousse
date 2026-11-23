import { createAuthClient } from 'better-auth/client';
import { inferAdditionalFields } from 'better-auth/client/plugins';

/** Same additional fields as the API's `user` (`apps/api/src/modules/auth/auth.ts`). */
export const parentFields = inferAdditionalFields({
  user: {
    firstName: { type: 'string', required: false },
    lastName: { type: 'string', required: false },
  },
});

/** Path of the BetterAuth routes under the API's URL (`AUTH_BASE_PATH` on the API). */
const AUTH_PATH = '/auth';

/**
 * Where the BetterAuth routes live: under `apiUrl` when one is configured,
 * else under `/api` on the page's own origin, which the web Worker forwards
 * to the API (ADR-0011).
 */
export function authEndpoint(apiUrl: string | undefined): {
  readonly baseURL?: string;
  readonly basePath?: string;
} {
  return apiUrl
    ? { baseURL: `${apiUrl.replace(/\/+$/, '')}${AUTH_PATH}` }
    : { basePath: `/api${AUTH_PATH}` };
}

export function createParentAuthClient(apiUrl: string | undefined) {
  return createAuthClient({ ...authEndpoint(apiUrl), plugins: [parentFields] });
}

/** What `BetterAuthGateway` needs from a BetterAuth client, whatever the platform. */
export type ParentAuthClient = ReturnType<typeof createParentAuthClient>;

/**
 * Built per platform by `auth-client-setup.ts` (web) and
 * `auth-client-setup.native.ts`, which Metro picks at bundle time.
 */
export interface AuthClientSetup {
  readonly client: ParentAuthClient;
  /**
   * The session cookie to add to business requests (`Cookie` header), or
   * `null` where the platform sends it on its own.
   */
  sessionCookie(): Promise<string | null>;
}
