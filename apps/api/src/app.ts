import Fastify, { type FastifyInstance } from 'fastify';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

import { authModule } from '#/modules/auth/index.js';
import { defisModule } from '#/modules/defis/index.js';
import { journalModule } from '#/modules/journal/index.js';
import { lettresModule } from '#/modules/lettres/index.js';
import { souvenirsModule } from '#/modules/souvenirs/index.js';
import type { Db } from '#/shared/db/client.js';
import { registerHealthRoute } from '#/shared/health/health-route.js';

export interface AppDependencies {
  readonly db: Db;
}

/**
 * Construit l'instance Fastify et enregistre chaque module comme un plugin
 * encapsulé (ADR-0001, ADR-0006). Séparé de `server.ts` pour rester
 * injectable dans `fastify.inject()` sans ouvrir de port (ADR-0007) : la
 * connexion à la base est reçue en paramètre, jamais créée ici.
 */
export function buildApp({ db }: AppDependencies): FastifyInstance {
  const app = Fastify({ logger: true });

  // Validation des entrées et sérialisation des sorties par schéma Zod.
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  registerHealthRoute(app, db);

  app.register(authModule, { prefix: '/auth' });
  app.register(journalModule, { prefix: '/journal' });
  app.register(defisModule, { prefix: '/defis' });
  app.register(souvenirsModule, { prefix: '/souvenirs' });
  app.register(lettresModule, { prefix: '/lettres' });

  return app;
}
