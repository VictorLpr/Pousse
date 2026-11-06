import type { FastifyInstance } from 'fastify';

import type { Db } from '#/shared/db/client.js';
import { child } from '#/shared/db/schema.js';
import { SESSION_COOKIE, TEST_ORIGIN } from './test-app.js';

/**
 * Fixtures shared by the integration tests: a signed-in parent, a child.
 * Rows go through the test transaction, so they vanish with its rollback.
 */

export interface SignedInParent {
  /** `user.id`, i.e. the `parent_id` of its children. */
  readonly id: string;
  readonly email: string;
  /** Cookies to pass to `inject()` to call a route as this parent. */
  readonly cookies: Record<string, string>;
}

let parentCount = 0;

/**
 * Signs a parent up through BetterAuth (the real route, ADR-0003) and returns
 * its session cookie. Each call uses a fresh email unless one is given.
 */
export async function signUpParent(
  app: FastifyInstance,
  { email = `parent-${++parentCount}@example.com`, lastName = 'Martin' } = {},
): Promise<SignedInParent> {
  const response = await app.inject({
    method: 'POST',
    url: '/auth/sign-up/email',
    headers: { origin: TEST_ORIGIN },
    payload: { name: 'Camille', email, password: 'correct-horse-battery', lastName },
  });
  const cookie = response.cookies.find(({ name }) => name === SESSION_COOKIE)?.value;
  if (response.statusCode !== 200 || !cookie) {
    throw new Error(`Parent sign-up failed: ${response.statusCode} ${response.body}`);
  }
  const { user } = response.json<{ user: { id: string } }>();
  return { id: user.id, email, cookies: { [SESSION_COOKIE]: cookie } };
}

/** Today's UTC date shifted by whole years and days, as `YYYY-MM-DD`. */
export function isoDate({ years = 0, days = 0 } = {}): string {
  const date = new Date();
  date.setUTCFullYear(date.getUTCFullYear() + years, date.getUTCMonth(), date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * Birth date of a child turning `years` old today; `days` moves it (`+1`:
 * the birthday is tomorrow, so the child is still `years - 1`).
 */
export function birthDateForAge(years: number, days = 0): string {
  return isoDate({ years: -years, days });
}

/** Inserts a child directly, without the routes' age rule. */
export async function insertChild(
  db: Db,
  parentId: string,
  values: Partial<typeof child.$inferInsert> = {},
): Promise<typeof child.$inferSelect> {
  const [row] = await db
    .insert(child)
    .values({ parentId, firstName: 'Lou', birthDate: birthDateForAge(6), ...values })
    .returning();
  if (!row) throw new Error('Child insert returned no row');
  return row;
}
