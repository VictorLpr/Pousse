import { beforeEach, describe, expect, it } from '@jest/globals';
import { eq, notInArray } from 'drizzle-orm';

import { challenge, childChallenge } from '#/shared/db/schema.js';
import { seedCatalogs } from '#/shared/db/seed-catalogs.js';
import {
  birthDateForAge,
  insertChild,
  isoDate,
  signUpParent,
  type SignedInParent,
} from '../support/fixtures.js';
import { useTestApp } from '../support/test-app.js';

const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';

const DAY_MS = 86_400_000;

interface ChildChallengeBody {
  id: string;
  status: string;
  chosenAt: string | null;
  completedAt: string | null;
  challenge: {
    code: string;
    title: string;
    description: string;
    category: string;
    ageRange: string;
  };
}

interface WeekBody {
  weekStart: string;
  challenges: ChildChallengeBody[];
}

/** `day` moved by whole days, both `YYYY-MM-DD`. */
function shiftDay(day: string, days: number): string {
  return new Date(Date.parse(`${day}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

/** Monday of the current ISO week (UTC), written independently of the service's helper. */
function currentMonday(): string {
  const today = isoDate();
  const sinceMonday = (new Date(`${today}T00:00:00Z`).getUTCDay() + 6) % 7;
  return shiftDay(today, -sinceMonday);
}

function codesOf(body: WeekBody): string[] {
  return body.challenges.map(({ challenge }) => challenge.code).sort();
}

describe('challenge routes', () => {
  const { app, db } = useTestApp();

  beforeEach(async () => {
    await seedCatalogs(db());
  });

  function getWeek(parent: SignedInParent, childId: string, today = isoDate()) {
    return app().inject({
      method: 'GET',
      url: '/challenges/week',
      query: { childId, today },
      cookies: parent.cookies,
    });
  }

  async function weekOf(parent: SignedInParent, childId: string): Promise<WeekBody> {
    const response = await getWeek(parent, childId);
    expect(response.statusCode).toBe(200);
    return response.json<WeekBody>();
  }

  function transition(parent: SignedInParent, id: string, action: 'choose' | 'complete') {
    return app().inject({
      method: 'POST',
      url: `/challenges/${id}/${action}`,
      cookies: parent.cookies,
    });
  }

  /** Leaves only these catalog challenges active, for the rolled-back test only. */
  async function keepOnlyActive(codes: string[]): Promise<void> {
    await db().update(challenge).set({ active: false }).where(notInArray(challenge.code, codes));
  }

  /** Offers a catalog challenge to a child directly, on any week and in any status. */
  async function insertChildChallenge(
    childId: string,
    code: string,
    weekStart: string,
    values: Partial<typeof childChallenge.$inferInsert> = {},
  ): Promise<string> {
    const [catalogEntry] = await db()
      .select({ id: challenge.id })
      .from(challenge)
      .where(eq(challenge.code, code));
    if (!catalogEntry) throw new Error(`No challenge ${code} in the catalog`);
    const [row] = await db()
      .insert(childChallenge)
      .values({ childId, challengeId: catalogEntry.id, weekStart, ...values })
      .returning({ id: childChallenge.id });
    if (!row) throw new Error('Child challenge insert returned no row');
    return row.id;
  }

  async function storedRow(id: string) {
    const [row] = await db().select().from(childChallenge).where(eq(childChallenge.id, id));
    return row;
  }

  it('refuses a caller without a session', async () => {
    const response = await app().inject({
      method: 'GET',
      url: '/challenges/week',
      query: { childId: UNKNOWN_ID, today: isoDate() },
    });

    expect(response.statusCode).toBe(401);
  });

  describe('GET /challenges/week', () => {
    it('draws three proposed challenges for the current week, then returns the same ones', async () => {
      const parent = await signUpParent(app());
      const child = await insertChild(db(), parent.id);

      const first = await weekOf(parent, child.id);
      const second = await weekOf(parent, child.id);

      expect(first.weekStart).toBe(currentMonday());
      expect(first.challenges).toHaveLength(3);
      for (const offered of first.challenges) {
        expect(offered).toEqual({
          id: expect.any(String),
          status: 'proposed',
          chosenAt: null,
          completedAt: null,
          challenge: {
            code: expect.any(String),
            title: expect.any(String),
            description: expect.any(String),
            category: expect.any(String),
            ageRange: expect.any(String),
          },
        });
      }
      expect(new Set(codesOf(first)).size).toBe(3);
      expect(second).toEqual(first);
      const stored = await db()
        .select()
        .from(childChallenge)
        .where(eq(childChallenge.childId, child.id));
      expect(stored).toHaveLength(3);
    });

    it('accepts the local day on either side of the UTC date', async () => {
      const parent = await signUpParent(app());
      const child = await insertChild(db(), parent.id);

      for (const today of [isoDate({ days: -1 }), isoDate({ days: 1 })]) {
        const response = await getWeek(parent, child.id, today);
        expect(response.statusCode).toBe(200);
        const { weekStart } = response.json<WeekBody>();
        expect(new Date(`${weekStart}T00:00:00Z`).getUTCDay()).toBe(1);
        expect(weekStart <= today && today <= shiftDay(weekStart, 6)).toBe(true);
      }
    });

    it("draws from the child's age range and the all-ages one, active challenges only", async () => {
      const parent = await signUpParent(app());
      const young = await insertChild(db(), parent.id, { birthDate: birthDateForAge(6) });
      const older = await insertChild(db(), parent.id, { birthDate: birthDateForAge(10) });

      for (const offered of (await weekOf(parent, young.id)).challenges) {
        expect(['4-7', '4-12']).toContain(offered.challenge.ageRange);
      }
      for (const offered of (await weekOf(parent, older.id)).challenges) {
        expect(['8-12', '4-12']).toContain(offered.challenge.ageRange);
      }

      // Three eligible challenges left for a ten-year-old: the draw has no choice.
      await keepOnlyActive(['tidy_toys', 'set_the_table', 'new_word', 'family_quiz', 'pillow_hut']);
      const other = await insertChild(db(), parent.id, { birthDate: birthDateForAge(10) });
      expect(codesOf(await weekOf(parent, other.id))).toEqual([
        'family_quiz',
        'new_word',
        'pillow_hut',
      ]);
    });

    it('avoids the challenges offered the week before', async () => {
      const parent = await signUpParent(app());
      const child = await insertChild(db(), parent.id, { birthDate: birthDateForAge(6) });
      const lastWeek = shiftDay(currentMonday(), -7);
      await keepOnlyActive([
        'tidy_toys',
        'set_the_table',
        'draw_your_family',
        'fold_laundry',
        'pillow_hut',
        'funny_story',
      ]);
      for (const code of ['tidy_toys', 'set_the_table', 'draw_your_family']) {
        await insertChildChallenge(child.id, code, lastWeek);
      }

      expect(codesOf(await weekOf(parent, child.id))).toEqual([
        'fold_laundry',
        'funny_story',
        'pillow_hut',
      ]);
    });

    it("takes last week's challenges back when the catalog runs short", async () => {
      const parent = await signUpParent(app());
      const child = await insertChild(db(), parent.id, { birthDate: birthDateForAge(6) });
      const lastWeek = shiftDay(currentMonday(), -7);
      const repeatable = ['tidy_toys', 'set_the_table', 'draw_your_family'];
      await keepOnlyActive([...repeatable, 'fold_laundry']);
      for (const code of repeatable) await insertChildChallenge(child.id, code, lastWeek);

      const codes = codesOf(await weekOf(parent, child.id));

      expect(codes).toHaveLength(3);
      expect(codes).toContain('fold_laundry');
      expect(codes.filter((code) => repeatable.includes(code))).toHaveLength(2);
    });

    it('expires the proposed and chosen challenges of earlier weeks, not the completed ones', async () => {
      const parent = await signUpParent(app());
      const child = await insertChild(db(), parent.id, { birthDate: birthDateForAge(6) });
      const lastWeek = shiftDay(currentMonday(), -7);
      const chosenAt = new Date(Date.now() - 7 * DAY_MS);
      const proposed = await insertChildChallenge(child.id, 'tidy_toys', lastWeek);
      const chosen = await insertChildChallenge(child.id, 'set_the_table', lastWeek, {
        status: 'chosen',
        chosenAt,
      });
      const completed = await insertChildChallenge(
        child.id,
        'draw_your_family',
        shiftDay(lastWeek, -7),
        { status: 'completed', chosenAt, completedAt: chosenAt },
      );

      await weekOf(parent, child.id);

      expect(await storedRow(proposed)).toMatchObject({ status: 'expired', chosenAt: null });
      expect(await storedRow(chosen)).toMatchObject({ status: 'expired', chosenAt });
      expect(await storedRow(completed)).toMatchObject({ status: 'completed' });
      expect((await transition(parent, chosen, 'complete')).json()).toMatchObject({
        code: 'INVALID_CHALLENGE_TRANSITION',
      });
      expect((await transition(parent, proposed, 'choose')).json()).toMatchObject({
        code: 'INVALID_CHALLENGE_TRANSITION',
      });
    });

    it('refuses a day more than one day away from the UTC date', async () => {
      const parent = await signUpParent(app());
      const child = await insertChild(db(), parent.id);

      for (const today of [isoDate({ days: -2 }), isoDate({ days: 2 })]) {
        const response = await getWeek(parent, child.id, today);
        expect(response.statusCode).toBe(422);
        expect(response.json()).toMatchObject({ code: 'DATE_OUT_OF_RANGE' });
      }
    });

    it('refuses a malformed day or child id', async () => {
      const parent = await signUpParent(app());
      const child = await insertChild(db(), parent.id);

      const queries: Record<string, string>[] = [
        { childId: child.id, today: '27/11/2026' },
        { childId: 'not-a-uuid', today: isoDate() },
        { childId: child.id },
      ];
      for (const query of queries) {
        const response = await app().inject({
          method: 'GET',
          url: '/challenges/week',
          query,
          cookies: parent.cookies,
        });
        expect(response.statusCode).toBe(400);
      }
    });

    it("answers 404 for another parent's child or an unknown one", async () => {
      const owner = await signUpParent(app());
      const stranger = await signUpParent(app());
      const child = await insertChild(db(), owner.id);

      for (const childId of [child.id, UNKNOWN_ID]) {
        const response = await getWeek(stranger, childId);
        expect(response.statusCode).toBe(404);
        expect(response.json()).toMatchObject({ code: 'CHILD_NOT_FOUND' });
      }
      const drawn = await db()
        .select()
        .from(childChallenge)
        .where(eq(childChallenge.childId, child.id));
      expect(drawn).toHaveLength(0);
    });
  });

  describe('POST /challenges/:id/choose and /complete', () => {
    it('chooses one challenge of the week, then completes it', async () => {
      const parent = await signUpParent(app());
      const child = await insertChild(db(), parent.id);
      const [picked] = (await weekOf(parent, child.id)).challenges;
      if (!picked) throw new Error('No challenge drawn');

      const chosen = await transition(parent, picked.id, 'choose');
      expect(chosen.statusCode).toBe(200);
      const chosenBody = chosen.json<ChildChallengeBody>();
      expect(chosenBody).toMatchObject({
        id: picked.id,
        status: 'chosen',
        completedAt: null,
        challenge: picked.challenge,
      });
      expect(chosenBody.chosenAt).toEqual(expect.any(String));

      const completed = await transition(parent, picked.id, 'complete');
      expect(completed.statusCode).toBe(200);
      const completedBody = completed.json<ChildChallengeBody>();
      expect(completedBody).toMatchObject({
        id: picked.id,
        status: 'completed',
        chosenAt: chosenBody.chosenAt,
      });
      expect(Date.parse(completedBody.completedAt ?? '')).toBeGreaterThanOrEqual(
        Date.parse(chosenBody.chosenAt ?? ''),
      );

      const week = await weekOf(parent, child.id);
      expect(week.challenges.find(({ id }) => id === picked.id)).toEqual(completedBody);
    });

    it('takes on one challenge per week only', async () => {
      const parent = await signUpParent(app());
      const child = await insertChild(db(), parent.id);
      const [first, second, third] = (await weekOf(parent, child.id)).challenges;
      if (!first || !second || !third) throw new Error('Three challenges expected');

      expect((await transition(parent, first.id, 'choose')).statusCode).toBe(200);
      const again = await transition(parent, second.id, 'choose');
      expect(again.statusCode).toBe(409);
      expect(again.json()).toMatchObject({ code: 'CHALLENGE_ALREADY_CHOSEN' });

      expect((await transition(parent, first.id, 'complete')).statusCode).toBe(200);
      const afterCompletion = await transition(parent, third.id, 'choose');
      expect(afterCompletion.statusCode).toBe(409);
      expect(afterCompletion.json()).toMatchObject({ code: 'CHALLENGE_ALREADY_CHOSEN' });

      expect(await storedRow(second.id)).toMatchObject({ status: 'proposed', chosenAt: null });
      expect(await storedRow(third.id)).toMatchObject({ status: 'proposed', chosenAt: null });
    });

    it('refuses the transitions the state machine forbids', async () => {
      const parent = await signUpParent(app());
      const child = await insertChild(db(), parent.id);
      const [picked, other] = (await weekOf(parent, child.id)).challenges;
      if (!picked || !other) throw new Error('Two challenges expected');

      const forbidden: [string, 'choose' | 'complete'][] = [];
      // A proposed challenge can't be completed.
      forbidden.push([other.id, 'complete']);
      expect((await transition(parent, picked.id, 'choose')).statusCode).toBe(200);
      // A chosen challenge can't be chosen again.
      forbidden.push([picked.id, 'choose']);
      for (const [id, action] of forbidden) {
        const response = await transition(parent, id, action);
        expect(response.statusCode).toBe(409);
        expect(response.json()).toMatchObject({ code: 'INVALID_CHALLENGE_TRANSITION' });
      }

      expect((await transition(parent, picked.id, 'complete')).statusCode).toBe(200);
      // A completed challenge can be neither chosen nor completed again.
      for (const action of ['choose', 'complete'] as const) {
        const response = await transition(parent, picked.id, action);
        expect(response.statusCode).toBe(409);
        expect(response.json()).toMatchObject({ code: 'INVALID_CHALLENGE_TRANSITION' });
      }
      expect(await storedRow(other.id)).toMatchObject({ status: 'proposed', completedAt: null });
    });

    it("answers 404 for another parent's challenge or an unknown one", async () => {
      const owner = await signUpParent(app());
      const stranger = await signUpParent(app());
      const child = await insertChild(db(), owner.id);
      const [picked] = (await weekOf(owner, child.id)).challenges;
      if (!picked) throw new Error('No challenge drawn');

      for (const id of [picked.id, UNKNOWN_ID]) {
        for (const action of ['choose', 'complete'] as const) {
          const response = await transition(stranger, id, action);
          expect(response.statusCode).toBe(404);
          expect(response.json()).toMatchObject({ code: 'CHILD_CHALLENGE_NOT_FOUND' });
        }
      }
      expect(await storedRow(picked.id)).toMatchObject({ status: 'proposed' });
    });

    it('refuses a malformed id', async () => {
      const parent = await signUpParent(app());

      const response = await transition(parent, 'not-a-uuid', 'choose');

      expect(response.statusCode).toBe(400);
    });
  });
});
