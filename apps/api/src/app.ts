import Fastify, { type FastifyInstance } from 'fastify';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

import { AUTH_BASE_PATH, authModule, createAuth } from '#/modules/auth/index.js';
import { challengesModule } from '#/modules/challenges/index.js';
import { journalModule } from '#/modules/journal/index.js';
import { lettersModule } from '#/modules/letters/index.js';
import { memoriesModule } from '#/modules/memories/index.js';
import type { Db } from '#/shared/db/client.js';
import { registerHealthRoute } from '#/shared/health/health-route.js';

export interface AppDependencies {
  readonly db: Db;
  readonly auth: {
    readonly secret: string;
    /** Public origin of the application, without a path. */
    readonly baseUrl: string;
  };
}

/**
 * Builds the Fastify instance and registers each module as an encapsulated
 * plugin (ADR-0001, ADR-0006). Kept apart from `server.ts` so it can be
 * driven by `fastify.inject()` without opening a port (ADR-0007): the
 * database connection is received as a parameter, never created here.
 */
export function buildApp({ db, auth: authConfig }: AppDependencies): FastifyInstance {
  const app = Fastify({ logger: true });

  // Input validation and output serialization through Zod schemas.
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  registerHealthRoute(app, db);

  const auth = createAuth({ db, ...authConfig, logger: app.log });

  app.register(authModule, { prefix: AUTH_BASE_PATH, auth, baseUrl: authConfig.baseUrl });
  app.register(journalModule, { prefix: '/journal' });
  app.register(challengesModule, { prefix: '/challenges' });
  app.register(memoriesModule, { prefix: '/memories' });
  app.register(lettersModule, { prefix: '/letters' });

  return app;
}
