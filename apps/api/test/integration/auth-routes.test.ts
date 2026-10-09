import { describe, expect, it } from '@jest/globals';
import { eq } from 'drizzle-orm';
import type { LightMyRequestResponse } from 'fastify';

import { account, session, user } from '#/shared/db/schema.js';
import { SESSION_COOKIE, TEST_ORIGIN, useTestApp } from '../support/test-app.js';

const EMAIL = 'parent@example.com';
const PASSWORD = 'correct-horse-battery';

interface SignUpBody {
  readonly email: string;
  readonly password: string;
  readonly name?: string;
  readonly firstName?: string;
  readonly lastName?: string;
}

/** Value of the session cookie set by a response, if any. */
function sessionCookie(response: LightMyRequestResponse): string | undefined {
  return response.cookies.find((cookie) => cookie.name === SESSION_COOKIE)?.value || undefined;
}

/** Every `Set-Cookie` header of a response, as an array. */
function setCookieHeaders(response: LightMyRequestResponse): string[] {
  const header = response.headers['set-cookie'];
  if (header === undefined) return [];
  return Array.isArray(header) ? header : [header];
}

describe('auth routes (BetterAuth, ADR-0003)', () => {
  const { app, db } = useTestApp();

  function signUp(body: Partial<SignUpBody> = {}, headers: Record<string, string> = {}) {
    return app().inject({
      method: 'POST',
      url: '/auth/sign-up/email',
      headers: { origin: TEST_ORIGIN, ...headers },
      payload: { name: 'Camille', email: EMAIL, password: PASSWORD, ...body },
    });
  }

  function signIn(email: string, password: string) {
    return app().inject({
      method: 'POST',
      url: '/auth/sign-in/email',
      headers: { origin: TEST_ORIGIN },
      payload: { email, password },
    });
  }

  function getSession(cookie?: string) {
    return app().inject({
      method: 'GET',
      url: '/auth/get-session',
      cookies: cookie ? { [SESSION_COOKIE]: cookie } : {},
    });
  }

  function signOut(cookie: string, headers: Record<string, string> = { origin: TEST_ORIGIN }) {
    return app().inject({
      method: 'POST',
      url: '/auth/sign-out',
      headers,
      cookies: { [SESSION_COOKIE]: cookie },
    });
  }

  /** Signs up and returns the session cookie. */
  async function signedUpCookie(): Promise<string> {
    const cookie = sessionCookie(await signUp());
    if (!cookie) throw new Error('Sign-up did not open a session');
    return cookie;
  }

  describe('POST /auth/sign-up/email', () => {
    it('creates the parent account and opens its session', async () => {
      const response = await signUp({ firstName: 'Camille', lastName: 'Martin' });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        user: { email: EMAIL, firstName: 'Camille', lastName: 'Martin', emailVerified: false },
      });

      const [row] = await db().select().from(user).where(eq(user.email, EMAIL));
      expect(row).toMatchObject({ firstName: 'Camille', lastName: 'Martin' });
      expect(row?.id).toMatch(/^[0-9a-f-]{36}$/);

      const [credentials] = await db().select().from(account).where(eq(account.userId, row!.id));
      expect(credentials?.providerId).toBe('credential');
      expect(credentials?.password).toBeTruthy();
      expect(credentials?.password).not.toContain(PASSWORD);
    });

    it('sets an HttpOnly, Secure, SameSite=Lax session cookie', async () => {
      const response = await signUp();

      const cookie = response.cookies.find(({ name }) => name === SESSION_COOKIE);
      expect(cookie).toMatchObject({ httpOnly: true, secure: true, sameSite: 'Lax', path: '/' });
      expect(cookie).not.toHaveProperty('domain');
    });

    it('accepts first and last names being left out', async () => {
      const response = await signUp();

      expect(response.statusCode).toBe(200);
      const [row] = await db().select().from(user).where(eq(user.email, EMAIL));
      expect(row).toMatchObject({ firstName: null, lastName: null });
    });

    it('rejects an email already in use', async () => {
      await signUp();

      const response = await signUp({ password: 'another-password' });

      expect(response.statusCode).toBe(422);
      expect(response.json()).toMatchObject({ code: 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL' });
      expect(await db().select().from(user).where(eq(user.email, EMAIL))).toHaveLength(1);
    });

    // Same bounds as the mobile app (`MIN/MAX_PASSWORD_LENGTH`).
    it.each([
      { length: 7, code: 'PASSWORD_TOO_SHORT' },
      { length: 129, code: 'PASSWORD_TOO_LONG' },
    ])('rejects a $length-character password with $code', async ({ length, code }) => {
      const response = await signUp({ password: 'a'.repeat(length) });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toMatchObject({ code });
      expect(await db().select().from(user)).toHaveLength(0);
    });

    it.each([8, 128])('accepts a %i-character password', async (length) => {
      const response = await signUp({ password: 'a'.repeat(length) });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('POST /auth/sign-in/email', () => {
    it('opens a new session with the right credentials', async () => {
      await signUp();

      const response = await signIn(EMAIL, PASSWORD);

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({ user: { email: EMAIL } });
      expect(sessionCookie(response)).toBeDefined();
      // One session from the sign-up, one from the sign-in.
      expect(await db().select().from(session)).toHaveLength(2);
    });

    it.each([
      { case: 'a wrong password', email: EMAIL, password: 'wrong-password' },
      { case: 'an unknown email', email: 'nobody@example.com', password: PASSWORD },
    ])('answers 401 INVALID_EMAIL_OR_PASSWORD to $case', async ({ email, password }) => {
      await signUp();

      const response = await signIn(email, password);

      expect(response.statusCode).toBe(401);
      expect(response.json()).toMatchObject({ code: 'INVALID_EMAIL_OR_PASSWORD' });
      expect(sessionCookie(response)).toBeUndefined();
    });
  });

  describe('GET /auth/get-session', () => {
    it('returns the session and the parent for a valid cookie', async () => {
      const cookie = await signedUpCookie();

      const response = await getSession(cookie);

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({ user: { email: EMAIL }, session: {} });
    });

    it('returns null without a cookie', async () => {
      const response = await getSession();

      expect(response.statusCode).toBe(200);
      expect(response.json()).toBeNull();
    });
  });

  describe('POST /auth/sign-out', () => {
    it('revokes the session immediately', async () => {
      const cookie = await signedUpCookie();

      const response = await signOut(cookie);

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ success: true });
      expect(await db().select().from(session)).toHaveLength(0);
      expect((await getSession(cookie)).json()).toBeNull();
    });

    // BetterAuth clears several cookies at once: the Fastify bridge must
    // copy every `Set-Cookie` header, not just the first one.
    it('forwards every Set-Cookie header', async () => {
      const cookie = await signedUpCookie();

      const headers = setCookieHeaders(await signOut(cookie));

      expect(headers.length).toBeGreaterThan(1);
      expect(headers.some((header) => header.startsWith(`${SESSION_COOKIE}=;`))).toBe(true);
      for (const header of headers) expect(header).toContain('Max-Age=0');
    });

    it.each<{ case: string; headers: Record<string, string>; code: string }>([
      { case: 'without an Origin header', headers: {}, code: 'MISSING_OR_NULL_ORIGIN' },
      {
        case: 'from a foreign origin',
        headers: { origin: 'https://evil.example.com' },
        code: 'INVALID_ORIGIN',
      },
    ])('refuses a cookie-authenticated request $case', async ({ headers, code }) => {
      const cookie = await signedUpCookie();

      const response = await signOut(cookie, headers);

      expect(response.statusCode).toBe(403);
      expect(response.json()).toMatchObject({ code });
      expect((await getSession(cookie)).json()).not.toBeNull();
    });
  });

  describe('client IP', () => {
    async function sessionIp(headers: Record<string, string>): Promise<string | null> {
      const response = await signUp({}, headers);
      expect(response.statusCode).toBe(200);
      const [row] = await db().select({ ipAddress: session.ipAddress }).from(session);
      return row?.ipAddress ?? null;
    }

    it('reads the client IP from the X-Client-IP header set by the Worker', async () => {
      expect(await sessionIp({ 'x-client-ip': '203.0.113.7' })).toBe('203.0.113.7');
    });

    // Behind Cloudflare and Scaleway, X-Forwarded-For holds several addresses.
    it('ignores X-Forwarded-For', async () => {
      expect(await sessionIp({ 'x-forwarded-for': '203.0.113.7, 172.70.1.1' })).not.toBe(
        '203.0.113.7',
      );
    });
  });
});
