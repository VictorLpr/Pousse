import { buildApp } from '#/app.js';
import { loadEnv } from '#/shared/config/env.js';
import { createDbClient } from '#/shared/db/client.js';

const env = loadEnv();
const db = createDbClient(env.databaseUrl);
const app = buildApp({ db });

app.addHook('onClose', async () => {
  await db.$client.end();
});

// Arrêt propre sur `docker stop` (SIGTERM) et Ctrl+C (SIGINT).
for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.once(signal, () => {
    app.log.info(`${signal} reçu, arrêt du serveur`);
    void app.close().then(() => process.exit(0));
  });
}

app.listen({ port: env.port, host: '0.0.0.0' }).catch((error: unknown) => {
  app.log.error(error);
  process.exit(1);
});
