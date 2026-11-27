import { beforeEach, describe, expect, it } from '@jest/globals';
import { eq } from 'drizzle-orm';

import { BADGES } from '#/shared/db/catalogs/badges.js';
import {
  badgeAward,
  challenge,
  childChallenge,
  emotion,
  journalEntry,
} from '#/shared/db/schema.js';
import { seedCatalogs } from '#/shared/db/seed-catalogs.js';
import { insertChild, isoDate, signUpParent, type SignedInParent } from '../support/fixtures.js';
import { useTestApp } from '../support/test-app.js';

const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';

const DAY_MS = 86_400_000;

interface BadgeBody {
  code: string;
  label: string;
  description: string | null;
  awardedAt: string | null;
}

/** `day` moved by whole days, both `YYYY-MM-DD`. */
function shiftDay(day: string, days: number): string {
  return new Date(Date.parse(`${day}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

/** Monday of the current ISO week (UTC). */
function currentMonday(): string {
  const today = isoDate();
  return shiftDay(today, -((new Date(`${today}T00:00:00Z`).getUTCDay() + 6) % 7));
}

/** The `count` days before `day`, `day` excluded. */
function daysBefore(day: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) => shiftDay(day, -(index + 1)));
}

const codesOf = (badges: BadgeBody[]) => badges.map(({ code }) => code);

describe('badges', () => {
  const { app, db } = useTestApp();

  beforeEach(async () => {
    await seedCatalogs(db());
  });

  async function parentWithChild() {
    const parent = await signUpParent(app());
    const child = await insertChild(db(), parent.id);
    return { parent, child };
  }

  function getBadges(parent: SignedInParent, childId: string) {
    return app().inject({
      method: 'GET',
      url: '/challenges/badges',
      query: { childId },
      cookies: parent.cookies,
    });
  }

  function createEntry(parent: SignedInParent, childId: string, date = isoDate()) {
    return app().inject({
      method: 'POST',
      url: '/journal/entries',
      cookies: parent.cookies,
      payload: { childId, emotionCode: 'happy', text: 'Souvenir du soir', date },
    });
  }

  /** Writes entries straight to the database, on dates the routes would refuse. */
  async function insertEntries(childId: string, dates: readonly string[]) {
    if (dates.length === 0) return;
    const [happy] = await db().select().from(emotion).where(eq(emotion.code, 'happy'));
    if (!happy) throw new Error('Emotion catalog is not seeded');
    await db()
      .insert(journalEntry)
      .values(dates.map((date) => ({ childId, emotionId: happy.id, text: 'Souvenir', date })));
  }

  /** A challenge of the catalog the child has chosen, `weeksAgo` weeks back. */
  async function chosenChallenge(childId: string, code: string, weeksAgo = 0): Promise<string> {
    const [entry] = await db()
      .select({ id: challenge.id })
      .from(challenge)
      .where(eq(challenge.code, code));
    if (!entry) throw new Error(`No challenge ${code} in the catalog`);
    const [row] = await db()
      .insert(childChallenge)
      .values({
        childId,
        challengeId: entry.id,
        weekStart: shiftDay(currentMonday(), -7 * weeksAgo),
        status: 'chosen',
        chosenAt: new Date(Date.now() - (7 * weeksAgo + 1) * DAY_MS),
      })
      .returning({ id: childChallenge.id });
    if (!row) throw new Error('Child challenge insert returned no row');
    return row.id;
  }

  function complete(parent: SignedInParent, id: string) {
    return app().inject({
      method: 'POST',
      url: `/challenges/${id}/complete`,
      cookies: parent.cookies,
    });
  }

  async function awardedBy(response: Awaited<ReturnType<typeof complete>>): Promise<string[]> {
    expect([200, 201]).toContain(response.statusCode);
    return codesOf(response.json<{ awardedBadges: BadgeBody[] }>().awardedBadges);
  }

  describe('GET /challenges/badges', () => {
    it('lists the whole catalog in catalog order, none earned yet', async () => {
      const { parent, child } = await parentWithChild();

      const response = await getBadges(parent, child.id);

      expect(response.statusCode).toBe(200);
      // `toEqual`: an internal id leaking past the schema would fail.
      expect(response.json()).toEqual(
        BADGES.map(({ code, label, description }) => ({
          code,
          label,
          description: description ?? null,
          awardedAt: null,
        })),
      );
    });

    it('dates the badges the child earned, and only that child', async () => {
      const { parent, child } = await parentWithChild();
      const sibling = await insertChild(db(), parent.id, { firstName: 'Noé' });
      const written = await createEntry(parent, child.id);
      const [earned] = written.json<{ awardedBadges: BadgeBody[] }>().awardedBadges;

      const mine = (await getBadges(parent, child.id)).json<BadgeBody[]>();
      const theirs = (await getBadges(parent, sibling.id)).json<BadgeBody[]>();

      expect(mine.find(({ code }) => code === 'first_evening')).toEqual(earned);
      expect(mine.filter(({ awardedAt }) => awardedAt !== null)).toHaveLength(1);
      expect(theirs.every(({ awardedAt }) => awardedAt === null)).toBe(true);
    });

    it('answers 404 CHILD_NOT_FOUND for a child of another parent', async () => {
      const { child } = await parentWithChild();
      const stranger = await signUpParent(app());

      const response = await getBadges(stranger, child.id);

      expect(response.statusCode).toBe(404);
      expect(response.json()).toMatchObject({ code: 'CHILD_NOT_FOUND' });
    });

    it('answers 404 CHILD_NOT_FOUND for an unknown child', async () => {
      const parent = await signUpParent(app());

      const response = await getBadges(parent, UNKNOWN_ID);

      expect(response.statusCode).toBe(404);
      expect(response.json()).toMatchObject({ code: 'CHILD_NOT_FOUND' });
    });

    it('answers 400 VALIDATION_FAILED without a child id', async () => {
      const parent = await signUpParent(app());

      const response = await app().inject({
        method: 'GET',
        url: '/challenges/badges',
        cookies: parent.cookies,
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toMatchObject({ code: 'VALIDATION_FAILED' });
    });

    it('answers 401 UNAUTHORIZED without a session', async () => {
      const response = await app().inject({
        method: 'GET',
        url: `/challenges/badges?childId=${UNKNOWN_ID}`,
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });

  describe('evening badges, after POST /journal/entries', () => {
    it('awards first_evening with the first entry', async () => {
      const { parent, child } = await parentWithChild();

      expect(await awardedBy(await createEntry(parent, child.id))).toEqual(['first_evening']);
    });

    it.each([
      { streak: 3, earned: ['three_evenings'] },
      { streak: 7, earned: ['three_evenings', 'seven_evenings'] },
      { streak: 30, earned: ['three_evenings', 'seven_evenings', 'thirty_evenings'] },
    ])('awards $earned on a streak of $streak evenings', async ({ streak, earned }) => {
      const { parent, child } = await parentWithChild();
      await insertEntries(child.id, daysBefore(isoDate(), streak - 1));

      expect(await awardedBy(await createEntry(parent, child.id))).toEqual([
        'first_evening',
        ...earned,
      ]);
    });

    it('awards no streak badge when an evening was missed', async () => {
      const { parent, child } = await parentWithChild();
      // Two evenings, a missed one, then tonight: a streak of 1.
      await insertEntries(child.id, daysBefore(isoDate(), 4).slice(2));

      expect(await awardedBy(await createEntry(parent, child.id))).toEqual(['first_evening']);
    });

    it('counts the streak up to the entry day, not beyond', async () => {
      const { parent, child } = await parentWithChild();
      const yesterday = isoDate({ days: -1 });
      // Tonight's entry already written: yesterday's makes a streak of 2, not 3.
      await insertEntries(child.id, [isoDate(), shiftDay(yesterday, -1)]);

      expect(await awardedBy(await createEntry(parent, child.id, yesterday))).toEqual([
        'first_evening',
      ]);
    });

    it('awards a badge once: a later entry meeting it again answers none', async () => {
      const { parent, child } = await parentWithChild();
      await insertEntries(child.id, daysBefore(isoDate({ days: -1 }), 2));
      expect(await awardedBy(await createEntry(parent, child.id, isoDate({ days: -1 })))).toEqual([
        'first_evening',
        'three_evenings',
      ]);

      expect(await awardedBy(await createEntry(parent, child.id))).toEqual([]);
      expect(await db().select().from(badgeAward)).toHaveLength(2);
    });

    it('awards nothing to an entry refused as a duplicate', async () => {
      const { parent, child } = await parentWithChild();
      await insertEntries(child.id, [isoDate()]);

      expect((await createEntry(parent, child.id)).statusCode).toBe(409);
      expect(await db().select().from(badgeAward)).toHaveLength(0);
    });
  });

  describe('challenge badges, after POST /challenges/:id/complete', () => {
    it('awards first_challenge and the category of the first challenge', async () => {
      const { parent, child } = await parentWithChild();
      const id = await chosenChallenge(child.id, 'set_the_table');

      expect(await awardedBy(await complete(parent, id))).toEqual([
        'first_challenge',
        'helping_challenge',
      ]);
    });

    it.each([
      { code: 'fold_laundry', badge: 'helping_challenge' },
      { code: 'draw_your_family', badge: 'creativity_challenge' },
      { code: 'find_red_things', badge: 'learning_challenge' },
      { code: 'magic_words', badge: 'politeness_challenge' },
    ])('awards $badge for a completed $code', async ({ code, badge }) => {
      const { parent, child } = await parentWithChild();
      // A first challenge of another category already completed.
      const first = await chosenChallenge(
        child.id,
        badge === 'creativity_challenge' ? 'kind_compliment' : 'funny_story',
        1,
      );
      const firstBadges = await awardedBy(await complete(parent, first));
      const id = await chosenChallenge(child.id, code);

      const earned = await awardedBy(await complete(parent, id));

      expect(firstBadges).not.toContain(badge);
      expect(earned).toEqual([badge]);
    });

    it('awards a category once: a second challenge of it answers none', async () => {
      const { parent, child } = await parentWithChild();
      await awardedBy(await complete(parent, await chosenChallenge(child.id, 'tidy_toys', 1)));

      const again = await complete(parent, await chosenChallenge(child.id, 'set_the_table'));

      expect(await awardedBy(again)).toEqual([]);
      expect(await db().select().from(badgeAward)).toHaveLength(2);
    });

    it('awards nothing when the completion is refused', async () => {
      const { child } = await parentWithChild();
      const id = await chosenChallenge(child.id, 'tidy_toys');
      const stranger = await signUpParent(app());

      expect((await complete(stranger, id)).statusCode).toBe(404);
      expect(await db().select().from(badgeAward)).toHaveLength(0);
    });
  });
});
