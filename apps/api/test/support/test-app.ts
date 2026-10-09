import { afterEach, beforeEach } from '@jest/globals';
import type { FastifyInstance } from 'fastify';

import { buildApp } from '#/app.js';
import { useTestDatabase } from './test-database.js';

/** Public origin given to BetterAuth: HTTPS, as in staging and production. */
export const TEST_ORIGIN = 'https://pousse.test';

/** Name of the session cookie, `__Secure-` prefixed because of HTTPS. */
export const SESSION_COOKIE = '__Secure-better-auth.session_token';

const TEST_SECRET = 'test-secret-at-least-32-characters-long';

export interface TestApp {
  /** Application built on the test transaction. */
  readonly app: () => FastifyInstance;
  /** Test transaction, to check what the routes wrote. */
  readonly db: ReturnType<typeof useTestDatabase>;
}

/**
 * Builds a fresh application for each test of the calling file, on the
 * transaction opened by `useTestDatabase`, and drives it through
 * `fastify.inject()` (ADR-0007).
 */
export function useTestApp(): TestApp {
  const db = useTestDatabase();
  const current: { app?: FastifyInstance } = {};

  beforeEach(async () => {
    current.app = buildApp({
      db: db(),
      auth: { secret: TEST_SECRET, baseUrl: TEST_ORIGIN },
      logger: false,
    });
    await current.app.ready();
  });

  afterEach(async () => {
    await current.app?.close();
    delete current.app;
  });

  return {
    app: () => {
      if (!current.app) throw new Error('No test application: call this getter inside a test');
      return current.app;
    },
    db,
  };
}
