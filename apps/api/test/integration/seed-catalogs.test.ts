import { beforeEach, describe, expect, it } from '@jest/globals';
import { asc, eq, sql } from 'drizzle-orm';

import { CHALLENGES } from '#/shared/db/catalogs/challenges.js';
import { seedCatalogs } from '#/shared/db/seed-catalogs.js';
import { challenge } from '#/shared/db/schema.js';
import { useTestDatabase } from '../support/test-database.js';

const AGE_RANGES = ['4-7', '8-12'] as const;
const CATEGORIES = ['helping', 'creativity', 'learning', 'politeness'];

describe('seedCatalogs: challenge catalog', () => {
  const db = useTestDatabase();

  const storedChallenges = () =>
    db()
      .select({
        code: challenge.code,
        title: challenge.title,
        description: challenge.description,
        ageRange: challenge.ageRange,
        category: challenge.category,
        active: challenge.active,
      })
      .from(challenge)
      .orderBy(asc(challenge.id));

  const expectedChallenges = CHALLENGES.map((row) => ({ ...row, active: row.active ?? true }));

  beforeEach(async () => {
    await seedCatalogs(db());
  });

  it('loads the whole catalog, in catalog order', async () => {
    expect(await storedChallenges()).toEqual(expectedChallenges);
  });

  it('gives the same content on a second pass', async () => {
    await seedCatalogs(db());

    expect(await storedChallenges()).toEqual(expectedChallenges);
  });

  it('restores the content changed in the database, active flag included', async () => {
    await db()
      .update(challenge)
      .set({ title: 'Autre titre', description: 'Autre', category: 'learning', active: false })
      .where(eq(challenge.code, 'tidy_toys'));
    await db().update(challenge).set({ ageRange: '8-12' }).where(eq(challenge.code, 'pillow_hut'));

    await seedCatalogs(db());

    expect(await storedChallenges()).toEqual(expectedChallenges);
  });

  it('draws no identity value when re-seeding an up-to-date catalog', async () => {
    // `currval` is the last value this session drew (the `beforeEach` seed):
    // unlike `last_value`, other Jest workers seeding in parallel don't move it.
    const lastId = async () =>
      (await db().execute<{ value: string }>(sql`select currval('challenge_id_seq') as value`))
        .rows[0]?.value;
    const before = await lastId();

    await seedCatalogs(db());

    expect(await lastId()).toBe(before);
  });

  it('refuses a second challenge with an existing code', async () => {
    await expect(
      db().insert(challenge).values({
        code: 'tidy_toys',
        title: 'Doublon',
        description: 'Doublon',
        ageRange: '4-7',
        category: 'helping',
      }),
    ).rejects.toMatchObject({ cause: { constraint: 'challenge_code_key' } });
  });

  it.each(AGE_RANGES)(
    'offers the %s range at least six active challenges, in every category',
    async (ageRange) => {
      const drawable = (await storedChallenges()).filter(
        (row) => row.active && (row.ageRange === ageRange || row.ageRange === '4-12'),
      );

      expect(drawable.length).toBeGreaterThanOrEqual(6);
      expect(new Set(drawable.map((row) => row.category))).toEqual(new Set(CATEGORIES));
    },
  );
});
