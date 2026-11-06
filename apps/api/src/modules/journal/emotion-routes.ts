import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import type { EmotionService } from '#/modules/journal/emotion-service.js';

const emotionsResponse = z.array(
  z.object({
    code: z.string(),
    label: z.string(),
  }),
);

/** `GET /emotions`: the emotion catalog, in display order. */
export function registerEmotionRoutes(app: FastifyInstance, service: EmotionService): void {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/emotions', { schema: { response: { 200: emotionsResponse } } }, () =>
      service.listEmotions(),
    );
}
