import { describe, expect, it } from '@jest/globals';
import { eq } from 'drizzle-orm';

import { createChildService } from '#/modules/auth/child-service.js';
import { createConsentRepository } from '#/modules/auth/consent-repository.js';
import { child, consent, session } from '#/shared/db/schema.js';
import {
  birthDateForAge,
  insertChild,
  signUpParent,
  type SignedInParent,
} from '../support/fixtures.js';
import { SESSION_COOKIE, useTestApp } from '../support/test-app.js';

const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';

const CONSENT = { policyVersion: '1.0', guardianAttested: true };

describe('children routes', () => {
  const { app, db } = useTestApp();

  /** Sends a valid consent unless the payload overrides it. */
  function createChild(parent: SignedInParent, payload: Record<string, unknown>) {
    return app().inject({
      method: 'POST',
      url: '/children',
      cookies: parent.cookies,
      payload: { consent: CONSENT, ...payload },
    });
  }

  function getConsent(parent: SignedInParent, id: string) {
    return app().inject({ method: 'GET', url: `/children/${id}/consent`, cookies: parent.cookies });
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
      { method: 'GET', url: `/children/${UNKNOWN_ID}/consent` },
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

    // BetterAuth extends a session once `updateAge` has passed and re-issues
    // its cookie: the business routes must forward it like the auth routes.
    it('forwards the cookie of a session BetterAuth extends', async () => {
      const parent = await signUpParent(app());
      await db()
        .update(session)
        .set({ expiresAt: new Date(Date.now() + 60 * 60 * 1000) })
        .where(eq(session.userId, parent.id));

      const response = await app().inject({
        method: 'GET',
        url: '/children',
        cookies: parent.cookies,
      });

      expect(response.statusCode).toBe(200);
      expect(response.cookies.find(({ name }) => name === SESSION_COOKIE)?.maxAge).toBeGreaterThan(
        60 * 60,
      );
    });

    it('answers an unknown route with 404 ROUTE_NOT_FOUND', async () => {
      const response = await app().inject({ method: 'GET', url: '/childrens' });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toMatchObject({ code: 'ROUTE_NOT_FOUND' });
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

    it('records the parental consent with the child', async () => {
      const parent = await signUpParent(app());
      const response = await createChild(parent, {
        firstName: 'Lou',
        birthDate: birthDateForAge(6),
        consent: { policyVersion: ' 2.1 ', guardianAttested: true },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).not.toHaveProperty('consent');
      const { id } = response.json<{ id: string }>();
      const rows = await db().select().from(consent);
      expect(rows).toEqual([
        {
          id: expect.any(String),
          childId: id,
          givenAt: expect.any(Date),
          policyVersion: '2.1',
          guardianAttested: true,
        },
      ]);
    });

    it.each([
      { case: 'no consent', consent: undefined },
      {
        case: 'a guardian attestation set to false',
        consent: { ...CONSENT, guardianAttested: false },
      },
      { case: 'no guardian attestation', consent: { policyVersion: '1.0' } },
      { case: 'no policy version', consent: { guardianAttested: true } },
      { case: 'a blank policy version', consent: { ...CONSENT, policyVersion: '  ' } },
      {
        case: 'a policy version over 10 characters',
        consent: { ...CONSENT, policyVersion: 'v'.repeat(11) },
      },
    ])('refuses $case with VALIDATION_FAILED and creates nothing', async ({ consent: given }) => {
      const parent = await signUpParent(app());

      const response = await createChild(parent, {
        firstName: 'Lou',
        birthDate: birthDateForAge(6),
        consent: given,
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toMatchObject({ code: 'VALIDATION_FAILED' });
      expect(await db().select().from(child)).toHaveLength(0);
      expect(await db().select().from(consent)).toHaveLength(0);
    });

    // Child and consent share one transaction: a consent the database refuses
    // leaves no child behind. The service is called directly to get past Zod;
    // 22001 is PostgreSQL refusing a value too long for `varchar(10)`.
    it('creates no child when the consent insert fails', async () => {
      const parent = await signUpParent(app());

      await expect(
        createChildService(db()).create(parent.id, {
          firstName: 'Lou',
          birthDate: birthDateForAge(6),
          consent: { policyVersion: 'v'.repeat(11), guardianAttested: true },
        }),
      ).rejects.toMatchObject({ cause: { code: '22001' } });

      expect(await db().select().from(child)).toHaveLength(0);
      expect(await db().select().from(consent)).toHaveLength(0);
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

  describe('GET /children/:id/consent', () => {
    it('returns the proof of consent: when, and which policy version', async () => {
      const parent = await signUpParent(app());
      const created = await createChild(parent, {
        firstName: 'Lou',
        birthDate: birthDateForAge(6),
      });
      const { id } = created.json<{ id: string }>();
      const [row] = await db().select().from(consent).where(eq(consent.childId, id));

      const response = await getConsent(parent, id);

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        givenAt: row?.givenAt.toISOString(),
        policyVersion: '1.0',
      });
    });

    it("answers 404 CHILD_NOT_FOUND for another parent's child", async () => {
      const parent = await signUpParent(app());
      const other = await signUpParent(app());
      const created = await createChild(other, {
        firstName: 'Inès',
        birthDate: birthDateForAge(6),
      });

      const response = await getConsent(parent, created.json<{ id: string }>().id);

      expect(response.statusCode).toBe(404);
      expect(response.json()).toMatchObject({ code: 'CHILD_NOT_FOUND' });
    });

    it('answers 404 CHILD_NOT_FOUND for an unknown child', async () => {
      const parent = await signUpParent(app());

      const response = await getConsent(parent, UNKNOWN_ID);

      expect(response.statusCode).toBe(404);
      expect(response.json()).toMatchObject({ code: 'CHILD_NOT_FOUND' });
    });

    // Profiles created before consent was required have none.
    it('answers 404 CONSENT_NOT_FOUND for a child without consent', async () => {
      const parent = await signUpParent(app());
      const row = await insertChild(db(), parent.id);

      const response = await getConsent(parent, row.id);

      expect(response.statusCode).toBe(404);
      expect(response.json()).toMatchObject({ code: 'CONSENT_NOT_FOUND' });
    });

    it('answers 400 VALIDATION_FAILED to an id that is not a UUID', async () => {
      const parent = await signUpParent(app());

      const response = await getConsent(parent, 'not-a-uuid');

      expect(response.statusCode).toBe(400);
      expect(response.json()).toMatchObject({ code: 'VALIDATION_FAILED' });
    });
  });

  describe('consent repository', () => {
    // ADR-0005: a consent is never updated, and no code path may offer it.
    it('exposes no update method', () => {
      expect(Object.keys(createConsentRepository(db())).sort()).toEqual(['findByChild', 'insert']);
    });
  });

  describe('database constraints', () => {
    it('refuses a consent without guardian attestation (consent_guardian_attested)', async () => {
      const parent = await signUpParent(app());
      const row = await insertChild(db(), parent.id);

      await expect(
        db()
          .insert(consent)
          .values({ childId: row.id, policyVersion: '1.0', guardianAttested: false }),
      ).rejects.toMatchObject({ cause: { constraint: 'consent_guardian_attested' } });
    });

    it('refuses a second consent for the same child (consent_child_id_key)', async () => {
      const parent = await signUpParent(app());
      const row = await insertChild(db(), parent.id);
      await db()
        .insert(consent)
        .values({ childId: row.id, ...CONSENT });

      await expect(
        db()
          .insert(consent)
          .values({ childId: row.id, policyVersion: '2.0', guardianAttested: true }),
      ).rejects.toMatchObject({ cause: { constraint: 'consent_child_id_key' } });
    });

    it('deletes the consent with its child', async () => {
      const parent = await signUpParent(app());
      const created = await createChild(parent, {
        firstName: 'Lou',
        birthDate: birthDateForAge(6),
      });
      const { id } = created.json<{ id: string }>();
      expect(await db().select().from(consent)).toHaveLength(1);

      await db().delete(child).where(eq(child.id, id));

      expect(await db().select().from(consent)).toHaveLength(0);
    });

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
