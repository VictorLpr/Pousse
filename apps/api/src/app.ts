import Fastify, { type FastifyInstance } from 'fastify';

import { authModule } from '@/modules/auth';
import { defisModule } from '@/modules/defis';
import { journalModule } from '@/modules/journal';
import { lettresModule } from '@/modules/lettres';
import { souvenirsModule } from '@/modules/souvenirs';

/**
 * Construit l'instance Fastify et enregistre chaque module comme un plugin
 * encapsulé (ADR-0001, ADR-0006). Séparé de `server.ts` pour rester
 * injectable dans `fastify.inject()` sans ouvrir de port (ADR-0007).
 */
export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: true });

  app.register(authModule, { prefix: '/auth' });
  app.register(journalModule, { prefix: '/journal' });
  app.register(defisModule, { prefix: '/defis' });
  app.register(souvenirsModule, { prefix: '/souvenirs' });
  app.register(lettresModule, { prefix: '/lettres' });

  return app;
}
