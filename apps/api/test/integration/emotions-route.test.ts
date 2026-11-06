import { beforeEach, describe, expect, it } from '@jest/globals';
import { eq, sql } from 'drizzle-orm';

import { seedCatalogs } from '#/shared/db/seed-catalogs.js';
import { emotion } from '#/shared/db/schema.js';
import { useTestApp } from '../support/test-app.js';

const SEEDED_EMOTIONS = [
  { code: 'happy', label: 'joyeux' },
  { code: 'proud', label: 'fier' },
  { code: 'calm', label: 'calme' },
  { code: 'surprised', label: 'surpris' },
  { code: 'sad', label: 'triste' },
  { code: 'angry', label: 'fâché' },
];

describe('GET /journal/emotions', () => {
  const { app, db } = useTestApp();

  beforeEach(async () => {
    await seedCatalogs(db());
  });

  it('lists the seeded catalog, code and label only, in display order', async () => {
    const response = await app().inject({ method: 'GET', url: '/journal/emotions' });

    expect(response.statusCode).toBe(200);
    // `toEqual` on plain objects: an `id` leaking past the schema would fail.
    expect(response.json()).toEqual(SEEDED_EMOTIONS);
  });

  it('seeds idempotently, restoring a changed label without duplicating rows', async () => {
    await db().update(emotion).set({ label: 'content' }).where(eq(emotion.code, 'happy'));

    await seedCatalogs(db());

    const response = await app().inject({ method: 'GET', url: '/journal/emotions' });
    expect(response.json()).toEqual(SEEDED_EMOTIONS);
  });

  it('draws no identity value when re-seeding an up-to-date catalog', async () => {
    // `currval` is the last value this session drew (the `beforeEach` seed):
    // unlike `last_value`, other Jest workers seeding in parallel don't move it.
    const lastId = async () =>
      (await db().execute<{ value: string }>(sql`select currval('emotion_id_seq') as value`))
        .rows[0]?.value;
    const before = await lastId();

    await seedCatalogs(db());

    expect(await lastId()).toBe(before);
  });
});
