import { buildApp } from '#/app.js';
import { loadEnv } from '#/shared/config/env.js';
import { createDbClient } from '#/shared/db/client.js';

const env = loadEnv();
const db = createDbClient(env.databaseUrl);
const app = buildApp({ db });

app.addHook('onClose', async () => {
  await db.$client.end();
});

// Graceful shutdown on `docker stop` (SIGTERM) and Ctrl+C (SIGINT).
for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.once(signal, () => {
    app.log.info(`${signal} received, shutting down`);
    void app.close().then(() => process.exit(0));
  });
}

app.listen({ port: env.port, host: '0.0.0.0' }).catch((error: unknown) => {
  app.log.error(error);
  process.exit(1);
});
