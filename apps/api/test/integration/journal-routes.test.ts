import { beforeEach, describe, expect, it } from '@jest/globals';
import { eq } from 'drizzle-orm';

import { emotion, journalEntry } from '#/shared/db/schema.js';
import { seedCatalogs } from '#/shared/db/seed-catalogs.js';
import { insertChild, isoDate, signUpParent, type SignedInParent } from '../support/fixtures.js';
import { useTestApp } from '../support/test-app.js';

const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';

const HOUR_MS = 60 * 60 * 1000;

describe('journal routes', () => {
  const { app, db } = useTestApp();

  beforeEach(async () => {
    await seedCatalogs(db());
  });

  function createEntry(parent: SignedInParent, payload: Record<string, unknown>) {
    return app().inject({
      method: 'POST',
      url: '/journal/entries',
      cookies: parent.cookies,
      payload: {
        emotionCode: 'happy',
        text: 'J’ai aidé à mettre la table.',
        date: isoDate(),
        ...payload,
      },
    });
  }

  function listEntries(parent: SignedInParent, childId: string) {
    return app().inject({
      method: 'GET',
      url: '/journal/entries',
      query: { childId },
      cookies: parent.cookies,
    });
  }

  function updateEntry(parent: SignedInParent, id: string, payload: Record<string, unknown>) {
    return app().inject({
      method: 'PATCH',
      url: `/journal/entries/${id}`,
      cookies: parent.cookies,
      payload,
    });
  }

  function getStreak(parent: SignedInParent, childId: string, today = isoDate()) {
    return app().inject({
      method: 'GET',
      url: '/journal/streak',
      query: { childId, today },
      cookies: parent.cookies,
    });
  }

  /** A parent with one child, signed in. */
  async function parentWithChild() {
    const parent = await signUpParent(app());
    const child = await insertChild(db(), parent.id);
    return { parent, child };
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

  describe('authentication', () => {
    it.each([
      { method: 'POST', url: '/journal/entries' },
      { method: 'GET', url: `/journal/entries?childId=${UNKNOWN_ID}` },
      { method: 'PATCH', url: `/journal/entries/${UNKNOWN_ID}` },
      { method: 'GET', url: `/journal/streak?childId=${UNKNOWN_ID}&today=${isoDate()}` },
    ] as const)('answers 401 UNAUTHORIZED to $method $url without a session', async (route) => {
      const response = await app().inject({ ...route, payload: { text: 'Souvenir' } });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toEqual({ code: 'UNAUTHORIZED', message: expect.any(String) });
    });

    it('keeps the emotion catalog public', async () => {
      const response = await app().inject({ method: 'GET', url: '/journal/emotions' });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('POST /journal/entries', () => {
    it('creates the entry of a child of the signed-in parent', async () => {
      const { parent, child } = await parentWithChild();
      const date = isoDate();

      const response = await createEntry(parent, {
        childId: child.id,
        emotionCode: 'proud',
        text: '  J’ai rangé ma chambre.  ',
        date,
      });

      expect(response.statusCode).toBe(201);
      // `toEqual`: an `emotionId` or `updatedAt` leaking past the schema would fail.
      expect(response.json()).toEqual({
        id: expect.any(String),
        childId: child.id,
        emotionCode: 'proud',
        text: 'J’ai rangé ma chambre.',
        date,
        createdAt: expect.any(String),
      });
    });

    it('answers 409 ENTRY_ALREADY_EXISTS to a second entry the same day', async () => {
      const { parent, child } = await parentWithChild();
      await createEntry(parent, { childId: child.id });

      const response = await createEntry(parent, { childId: child.id, emotionCode: 'calm' });

      expect(response.statusCode).toBe(409);
      expect(response.json()).toMatchObject({ code: 'ENTRY_ALREADY_EXISTS' });
      expect(await db().select().from(journalEntry)).toHaveLength(1);
    });

    it('lets a sibling write on the same day', async () => {
      const { parent, child } = await parentWithChild();
      const sibling = await insertChild(db(), parent.id, { firstName: 'Noé' });
      await createEntry(parent, { childId: child.id });

      const response = await createEntry(parent, { childId: sibling.id });

      expect(response.statusCode).toBe(201);
    });

    it.each([-1, 1])('accepts a local date %i day away from the UTC date', async (days) => {
      const { parent, child } = await parentWithChild();

      const response = await createEntry(parent, { childId: child.id, date: isoDate({ days }) });

      expect(response.statusCode).toBe(201);
    });

    it.each([-2, 2])(
      'answers 422 DATE_OUT_OF_RANGE to a date %i days away from the UTC date',
      async (days) => {
        const { parent, child } = await parentWithChild();

        const response = await createEntry(parent, { childId: child.id, date: isoDate({ days }) });

        expect(response.statusCode).toBe(422);
        expect(response.json()).toMatchObject({ code: 'DATE_OUT_OF_RANGE' });
      },
    );

    it('answers 422 UNKNOWN_EMOTION to an emotion outside the catalog', async () => {
      const { parent, child } = await parentWithChild();

      const response = await createEntry(parent, { childId: child.id, emotionCode: 'bored' });

      expect(response.statusCode).toBe(422);
      expect(response.json()).toMatchObject({ code: 'UNKNOWN_EMOTION' });
    });

    it.each([
      { case: 'a blank text', payload: { text: '   ' } },
      { case: 'a text over 500 characters', payload: { text: 'a'.repeat(501) } },
      { case: 'a malformed date', payload: { date: '13/11/2026' } },
      { case: 'no emotion', payload: { emotionCode: undefined } },
    ])('answers 400 VALIDATION_FAILED to $case', async ({ payload }) => {
      const { parent, child } = await parentWithChild();

      const response = await createEntry(parent, { childId: child.id, ...payload });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toMatchObject({ code: 'VALIDATION_FAILED' });
    });

    it('answers 404 CHILD_NOT_FOUND for a child of another parent', async () => {
      const { child } = await parentWithChild();
      const stranger = await signUpParent(app());

      const response = await createEntry(stranger, { childId: child.id });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toMatchObject({ code: 'CHILD_NOT_FOUND' });
      expect(await db().select().from(journalEntry)).toHaveLength(0);
    });
  });

  describe('GET /journal/entries', () => {
    it("lists one child's entries, newest day first", async () => {
      const { parent, child } = await parentWithChild();
      const sibling = await insertChild(db(), parent.id, { firstName: 'Noé' });
      await insertEntries(child.id, [isoDate({ days: -3 }), isoDate({ days: -1 })]);
      await insertEntries(sibling.id, [isoDate({ days: -1 })]);

      const response = await listEntries(parent, child.id);

      expect(response.statusCode).toBe(200);
      expect(response.json<{ date: string }[]>().map(({ date }) => date)).toEqual([
        isoDate({ days: -1 }),
        isoDate({ days: -3 }),
      ]);
    });

    it('answers 404 CHILD_NOT_FOUND for a child of another parent', async () => {
      const { child } = await parentWithChild();
      await insertEntries(child.id, [isoDate()]);
      const stranger = await signUpParent(app());

      const response = await listEntries(stranger, child.id);

      expect(response.statusCode).toBe(404);
      expect(response.json()).toMatchObject({ code: 'CHILD_NOT_FOUND' });
    });

    it('answers 400 VALIDATION_FAILED without a child id', async () => {
      const { parent } = await parentWithChild();

      const response = await app().inject({
        method: 'GET',
        url: '/journal/entries',
        cookies: parent.cookies,
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('PATCH /journal/entries/:id', () => {
    async function parentWithEntry() {
      const { parent, child } = await parentWithChild();
      const created = await createEntry(parent, { childId: child.id });
      return { parent, child, entry: created.json<{ id: string; date: string }>() };
    }

    it('changes the text and the emotion within 24 hours, never the date', async () => {
      const { parent, child, entry } = await parentWithEntry();

      const response = await updateEntry(parent, entry.id, {
        text: 'J’ai fait un dessin pour mamie.',
        emotionCode: 'calm',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        id: entry.id,
        childId: child.id,
        emotionCode: 'calm',
        text: 'J’ai fait un dessin pour mamie.',
        date: entry.date,
      });
    });

    it('changes one field and keeps the other', async () => {
      const { parent, entry } = await parentWithEntry();

      const response = await updateEntry(parent, entry.id, { emotionCode: 'sad' });

      expect(response.json()).toMatchObject({
        emotionCode: 'sad',
        text: 'J’ai aidé à mettre la table.',
      });
    });

    it('accepts an edit just before the window closes', async () => {
      const { parent, entry } = await parentWithEntry();
      await db()
        .update(journalEntry)
        .set({ createdAt: new Date(Date.now() - 23 * HOUR_MS) })
        .where(eq(journalEntry.id, entry.id));

      const response = await updateEntry(parent, entry.id, { text: 'Encore modifiable' });

      expect(response.statusCode).toBe(200);
    });

    it('answers 422 ENTRY_EDIT_WINDOW_CLOSED once 24 hours have passed', async () => {
      const { parent, entry } = await parentWithEntry();
      await db()
        .update(journalEntry)
        .set({ createdAt: new Date(Date.now() - 25 * HOUR_MS) })
        .where(eq(journalEntry.id, entry.id));

      const response = await updateEntry(parent, entry.id, { text: 'Trop tard' });

      expect(response.statusCode).toBe(422);
      expect(response.json()).toMatchObject({ code: 'ENTRY_EDIT_WINDOW_CLOSED' });
      const [row] = await db().select().from(journalEntry).where(eq(journalEntry.id, entry.id));
      expect(row?.text).toBe('J’ai aidé à mettre la table.');
    });

    it.each([
      { case: 'the date', payload: { date: isoDate({ days: -1 }) } },
      { case: 'the child', payload: { childId: UNKNOWN_ID } },
      { case: 'nothing', payload: {} },
    ])('answers 400 VALIDATION_FAILED to a body changing $case', async ({ payload }) => {
      const { parent, entry } = await parentWithEntry();

      const response = await updateEntry(parent, entry.id, payload);

      expect(response.statusCode).toBe(400);
      expect(response.json()).toMatchObject({ code: 'VALIDATION_FAILED' });
    });

    it('answers 422 UNKNOWN_EMOTION to an emotion outside the catalog', async () => {
      const { parent, entry } = await parentWithEntry();

      const response = await updateEntry(parent, entry.id, { emotionCode: 'bored' });

      expect(response.statusCode).toBe(422);
      expect(response.json()).toMatchObject({ code: 'UNKNOWN_EMOTION' });
    });

    it('answers 404 ENTRY_NOT_FOUND to an entry of another parent', async () => {
      const { entry } = await parentWithEntry();
      const stranger = await signUpParent(app());

      const response = await updateEntry(stranger, entry.id, { text: 'Pas à moi' });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toMatchObject({ code: 'ENTRY_NOT_FOUND' });
    });

    it('answers 404 ENTRY_NOT_FOUND to an unknown entry', async () => {
      const { parent } = await parentWithChild();

      const response = await updateEntry(parent, UNKNOWN_ID, { text: 'Rien' });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toMatchObject({ code: 'ENTRY_NOT_FOUND' });
    });
  });

  describe('GET /journal/streak', () => {
    it.each([
      { case: 'no entry at all', days: [], streak: 0 },
      { case: 'three evenings in a row up to today', days: [0, -1, -2], streak: 3 },
      { case: "tonight's ritual still to do", days: [-1, -2], streak: 2 },
      { case: 'yesterday missed', days: [-2, -3], streak: 0 },
      { case: 'tonight done after a missed evening', days: [0, -2, -3], streak: 1 },
      { case: 'an entry dated after today', days: [1, 0], streak: 1 },
    ])('counts $streak with $case', async ({ days, streak }) => {
      const { parent, child } = await parentWithChild();
      await insertEntries(
        child.id,
        days.map((offset) => isoDate({ days: offset })),
      );

      const response = await getStreak(parent, child.id);

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ streak });
    });

    it("counts from the family's local day, not the UTC day", async () => {
      const { parent, child } = await parentWithChild();
      // Ahead of UTC: the family's today is already tomorrow in UTC terms.
      await insertEntries(child.id, [isoDate(), isoDate({ days: 1 })]);

      const response = await getStreak(parent, child.id, isoDate({ days: 1 }));

      expect(response.json()).toEqual({ streak: 2 });
    });

    it.each([-2, 2])('answers 422 DATE_OUT_OF_RANGE to a today %i days away', async (days) => {
      const { parent, child } = await parentWithChild();

      const response = await getStreak(parent, child.id, isoDate({ days }));

      expect(response.statusCode).toBe(422);
      expect(response.json()).toMatchObject({ code: 'DATE_OUT_OF_RANGE' });
    });

    it('answers 400 VALIDATION_FAILED without today', async () => {
      const { parent, child } = await parentWithChild();

      const response = await app().inject({
        method: 'GET',
        url: '/journal/streak',
        query: { childId: child.id },
        cookies: parent.cookies,
      });

      expect(response.statusCode).toBe(400);
    });

    it('answers 404 CHILD_NOT_FOUND for a child of another parent', async () => {
      const { child } = await parentWithChild();
      const stranger = await signUpParent(app());

      const response = await getStreak(stranger, child.id);

      expect(response.statusCode).toBe(404);
      expect(response.json()).toMatchObject({ code: 'CHILD_NOT_FOUND' });
    });
  });
});
