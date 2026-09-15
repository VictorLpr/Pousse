import { buildApp } from '@/app';
import { loadEnv } from '@/shared/config/env';

const env = loadEnv();
const app = buildApp();

app.listen({ port: env.port, host: '0.0.0.0' }).catch((error: unknown) => {
  app.log.error(error);
  process.exit(1);
});
