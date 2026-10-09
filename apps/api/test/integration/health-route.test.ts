import { describe, expect, it } from '@jest/globals';

import { useTestApp } from '../support/test-app.js';

describe('GET /health', () => {
  const { app } = useTestApp();

  it('reports the database as reachable', async () => {
    const response = await app().inject({ method: 'GET', url: '/health' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok', database: 'ok' });
  });
});
