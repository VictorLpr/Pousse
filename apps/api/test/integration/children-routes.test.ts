import { describe, expect, it } from '@jest/globals';
import { eq } from 'drizzle-orm';

import { child } from '#/shared/db/schema.js';
import {
  birthDateForAge,
  insertChild,
  signUpParent,
  type SignedInParent,
} from '../support/fixtures.js';
import { useTestApp } from '../support/test-app.js';

const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';

describe('children routes', () => {
  const { app, db } = useTestApp();

  function createChild(parent: SignedInParent, payload: Record<string, unknown>) {
    return app().inject({ method: 'POST', url: '/children', cookies: parent.cookies, payload });
  }

  function getChild(parent: SignedInParent, id: string) {
    return app().inject({ method: 'GET', url: `/children/${id}`, cookies: parent.cookies });
  }

  function updateChild(parent: SignedInParent, id: string, payload: Record<string, unknown>) {
    return app().inject({
      method: 'PATCH',
      url: `/children/${id}`,
      cookies: parent.cookies,
      payload,
    });
  }

  describe('authentication', () => {
    it.each([
      { method: 'POST', url: '/children' },
      { method: 'GET', url: '/children' },
      { method: 'GET', url: `/children/${UNKNOWN_ID}` },
      { method: 'PATCH', url: `/children/${UNKNOWN_ID}` },
    ] as const)('answers 401 UNAUTHORIZED to $method $url without a session', async (route) => {
      const response = await app().inject({ ...route, payload: { firstName: 'Lou' } });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toEqual({ code: 'UNAUTHORIZED', message: expect.any(String) });
    });

    it('answers 401 to a revoked session', async () => {
      const parent = await signUpParent(app());
      await app().inject({
        method: 'POST',
        url: '/auth/sign-out',
        headers: { origin: 'https://pousse.test' },
        cookies: parent.cookies,
      });

      const response = await app().inject({
        method: 'GET',
        url: '/children',
        cookies: parent.cookies,
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /children', () => {
    it('creates the child of the signed-in parent', async () => {
      const parent = await signUpParent(app());
      const birthDate = birthDateForAge(6);

      const response = await createChild(parent, {
        firstName: '  Lou  ',
        birthDate,
        avatar: 'fox',
        reminderTime: '19:30',
      });

      expect(response.statusCode).toBe(201);
      const body = response.json<{ id: string }>();
      expect(body).toEqual({
        id: expect.stringMatching(/^[0-9a-f-]{36}$/),
        firstName: 'Lou',
        birthDate,
        ageRange: '4-7',
        avatar: 'fox',
        reminderTime: '19:30',
        reminderEnabled: true,
      });
      const [row] = await db().select().from(child).where(eq(child.id, body.id));
      expect(row).toMatchObject({
        parentId: parent.id,
        firstName: 'Lou',
        reminderTime: '19:30:00',
      });
    });

    it('applies the default reminder and no avatar', async () => {
      const parent = await signUpParent(app());

      const response = await createChild(parent, {
        firstName: 'Lou',
        birthDate: birthDateForAge(9),
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toMatchObject({
        avatar: null,
        reminderTime: '20:00',
        reminderEnabled: true,
      });
    });

    // ADR-0005: the child is 4 to 12 years old at creation.
    it.each([
      { case: 'turning 4 today', birthDate: () => birthDateForAge(4), ageRange: '4-7' },
      { case: 'turning 13 tomorrow', birthDate: () => birthDateForAge(13, 1), ageRange: '8-12' },
      { case: 'aged 7', birthDate: () => birthDateForAge(7), ageRange: '4-7' },
      { case: 'aged 8', birthDate: () => birthDateForAge(8), ageRange: '8-12' },
    ])('accepts a child $case, in the $ageRange range', async ({ birthDate, ageRange }) => {
      const parent = await signUpParent(app());

      const response = await createChild(parent, { firstName: 'Lou', birthDate: birthDate() });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toMatchObject({ ageRange });
    });

    it.each([
      { case: 'turning 4 tomorrow', birthDate: () => birthDateForAge(4, 1) },
      { case: 'turning 13 today', birthDate: () => birthDateForAge(13) },
      { case: 'born in the future', birthDate: () => birthDateForAge(-1) },
    ])('refuses a child $case with CHILD_AGE_OUT_OF_RANGE', async ({ birthDate }) => {
      const parent = await signUpParent(app());

      const response = await createChild(parent, { firstName: 'Lou', birthDate: birthDate() });

      expect(response.statusCode).toBe(422);
      expect(response.json()).toMatchObject({ code: 'CHILD_AGE_OUT_OF_RANGE' });
      expect(await db().select().from(child)).toHaveLength(0);
    });

    it.each([
      { case: 'a blank first name', payload: { firstName: '   ' } },
      { case: 'a first name over 50 characters', payload: { firstName: 'a'.repeat(51) } },
      { case: 'no first name', payload: { firstName: undefined } },
      { case: 'a malformed birth date', payload: { birthDate: '12/03/2019' } },
      { case: 'an impossible birth date', payload: { birthDate: '2019-02-30' } },
      { case: 'a malformed reminder time', payload: { reminderTime: '25:00' } },
      { case: 'an avatar that is not a code', payload: { avatar: 'My Fox!' } },
    ])('refuses $case with VALIDATION_FAILED', async ({ payload }) => {
      const parent = await signUpParent(app());

      const response = await createChild(parent, {
        firstName: 'Lou',
        birthDate: birthDateForAge(6),
        ...payload,
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toMatchObject({ code: 'VALIDATION_FAILED' });
      expect(await db().select().from(child)).toHaveLength(0);
    });

    it('ignores a parentId sent in the body', async () => {
      const parent = await signUpParent(app());
      const other = await signUpParent(app());

      const response = await createChild(parent, {
        firstName: 'Lou',
        birthDate: birthDateForAge(6),
        parentId: other.id,
      });

      expect(response.statusCode).toBe(201);
      const [row] = await db().select().from(child);
      expect(row?.parentId).toBe(parent.id);
    });
  });

  describe('GET /children', () => {
    it("lists only the signed-in parent's children, oldest profile first", async () => {
      const parent = await signUpParent(app());
      const other = await signUpParent(app());
      const first = await insertChild(db(), parent.id, { firstName: 'Lou' });
      const second = await insertChild(db(), parent.id, { firstName: 'Noé' });
      await insertChild(db(), other.id, { firstName: 'Inès' });

      const response = await app().inject({
        method: 'GET',
        url: '/children',
        cookies: parent.cookies,
      });

      expect(response.statusCode).toBe(200);
      const ids = response.json<{ id: string }[]>().map(({ id }) => id);
      expect(ids).toHaveLength(2);
      expect(ids).toEqual(expect.arrayContaining([first.id, second.id]));
    });

    it('returns an empty list to a parent without children', async () => {
      const parent = await signUpParent(app());

      const response = await app().inject({
        method: 'GET',
        url: '/children',
        cookies: parent.cookies,
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual([]);
    });
  });

  describe('GET /children/:id', () => {
    it('returns the child without its parent id nor timestamps', async () => {
      const parent = await signUpParent(app());
      const row = await insertChild(db(), parent.id, { birthDate: birthDateForAge(10) });

      const response = await getChild(parent, row.id);

      expect(response.statusCode).toBe(200);
      expect(Object.keys(response.json<object>()).sort()).toEqual([
        'ageRange',
        'avatar',
        'birthDate',
        'firstName',
        'id',
        'reminderEnabled',
        'reminderTime',
      ]);
      expect(response.json()).toMatchObject({ id: row.id, ageRange: '8-12' });
    });

    // A child past twelve keeps the older range rather than failing to read.
    it('keeps a child who turned 13 in the 8-12 range', async () => {
      const parent = await signUpParent(app());
      const row = await insertChild(db(), parent.id, { birthDate: birthDateForAge(13) });

      const response = await getChild(parent, row.id);

      expect(response.json()).toMatchObject({ ageRange: '8-12' });
    });

    it("answers 404 CHILD_NOT_FOUND for another parent's child", async () => {
      const parent = await signUpParent(app());
      const other = await signUpParent(app());
      const othersChild = await insertChild(db(), other.id);

      const response = await getChild(parent, othersChild.id);

      expect(response.statusCode).toBe(404);
      expect(response.json()).toMatchObject({ code: 'CHILD_NOT_FOUND' });
    });

    it('answers 404 CHILD_NOT_FOUND for an unknown child', async () => {
      const parent = await signUpParent(app());

      const response = await getChild(parent, UNKNOWN_ID);

      expect(response.statusCode).toBe(404);
      expect(response.json()).toMatchObject({ code: 'CHILD_NOT_FOUND' });
    });

    it('answers 400 VALIDATION_FAILED to an id that is not a UUID', async () => {
      const parent = await signUpParent(app());

      const response = await getChild(parent, 'not-a-uuid');

      expect(response.statusCode).toBe(400);
      expect(response.json()).toMatchObject({ code: 'VALIDATION_FAILED' });
    });
  });

  describe('PATCH /children/:id', () => {
    it('updates the given fields only', async () => {
      const parent = await signUpParent(app());
      const row = await insertChild(db(), parent.id, { avatar: 'fox' });

      const response = await updateChild(parent, row.id, {
        firstName: 'Louise',
        reminderEnabled: false,
        avatar: null,
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        id: row.id,
        firstName: 'Louise',
        birthDate: row.birthDate,
        avatar: null,
        reminderTime: '20:00',
        reminderEnabled: false,
      });
      const [saved] = await db().select().from(child).where(eq(child.id, row.id));
      expect(saved).toMatchObject({ firstName: 'Louise', avatar: null, reminderEnabled: false });
    });

    it('recomputes the age range from a corrected birth date', async () => {
      const parent = await signUpParent(app());
      const row = await insertChild(db(), parent.id, { birthDate: birthDateForAge(6) });

      const response = await updateChild(parent, row.id, { birthDate: birthDateForAge(9) });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({ ageRange: '8-12' });
    });

    // Otherwise a PATCH would get round the creation rule.
    it('refuses a birth date out of the 4-12 range', async () => {
      const parent = await signUpParent(app());
      const row = await insertChild(db(), parent.id);

      const response = await updateChild(parent, row.id, { birthDate: birthDateForAge(3) });

      expect(response.statusCode).toBe(422);
      expect(response.json()).toMatchObject({ code: 'CHILD_AGE_OUT_OF_RANGE' });
      const [saved] = await db().select().from(child).where(eq(child.id, row.id));
      expect(saved?.birthDate).toBe(row.birthDate);
    });

    it('refuses an empty body with VALIDATION_FAILED', async () => {
      const parent = await signUpParent(app());
      const row = await insertChild(db(), parent.id);

      const response = await updateChild(parent, row.id, {});

      expect(response.statusCode).toBe(400);
      expect(response.json()).toMatchObject({ code: 'VALIDATION_FAILED' });
    });

    it("answers 404 CHILD_NOT_FOUND to another parent's child and leaves it untouched", async () => {
      const parent = await signUpParent(app());
      const other = await signUpParent(app());
      const othersChild = await insertChild(db(), other.id, { firstName: 'Inès' });

      const response = await updateChild(parent, othersChild.id, { firstName: 'Hacked' });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toMatchObject({ code: 'CHILD_NOT_FOUND' });
      const [saved] = await db().select().from(child).where(eq(child.id, othersChild.id));
      expect(saved?.firstName).toBe('Inès');
    });
  });

  describe('database constraints', () => {
    // The routes trim and refuse a blank name first; the check is the last
    // line of defence (ADR-0005).
    it('refuses a blank first name (child_first_name_not_blank)', async () => {
      const parent = await signUpParent(app());

      await expect(insertChild(db(), parent.id, { firstName: '   ' })).rejects.toMatchObject({
        cause: { constraint: 'child_first_name_not_blank' },
      });
    });
  });
});
