import { expoClient } from '@better-auth/expo/client';
import { createAuthClient } from 'better-auth/client';
import * as SecureStore from 'expo-secure-store';

import {
  authEndpoint,
  parentFields,
  type AuthClientSetup,
} from '@/modules/auth/infrastructure/http/parent-auth-client';

/**
 * Native: the Expo plugin keeps the session cookie in the system keychain
 * (`expo-secure-store`, ADR-0003) and attaches it to the auth client's own
 * calls only; business requests add it themselves through `sessionCookie()`.
 * There is no same origin to fall back on: the API URL is required.
 */
export function createAuthClientSetup(apiUrl: string | undefined): AuthClientSetup {
  if (!apiUrl) {
    throw new Error('EXPO_PUBLIC_API_URL must be set for a native build.');
  }
  const client = createAuthClient({
    ...authEndpoint(apiUrl),
    plugins: [
      parentFields,
      expoClient({ scheme: 'pousse', storagePrefix: 'pousse', storage: SecureStore }),
    ],
  });
  return {
    client,
    sessionCookie: async () => (await client.getCookie()) || null,
  };
}
