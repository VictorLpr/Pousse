import { defineRelations } from 'drizzle-orm';
import { boolean, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/**
 * Physical schema (ADR-0002, ADR-0005): single source of truth, migrations
 * are generated from this file by drizzle-kit
 * (`npm run db:generate -w apps/api`).
 *
 * The `user`, `session`, `account` and `verification` tables are the ones
 * BetterAuth expects (ADR-0003): their column names don't change without
 * mirroring the change in `modules/auth/auth.ts`. The `user` table stands in
 * for the logical model's `PARENT`; the hashed password lives in
 * `account.password`.
 *
 * The other relations of the logical model are still to be declared (see
 * docs/data-model/data-model.html).
 */

export const user = pgTable('user', {
  id: uuid('id').primaryKey().defaultRandom(),
  /** Required by BetterAuth; the parent's first name lives in `firstName`. */
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const session = pgTable(
  'session',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [index('session_user_id_idx').on(table.userId)],
);

export const account = pgTable(
  'account',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [index('account_user_id_idx').on(table.userId)],
);

export const verification = pgTable(
  'verification',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)],
);

export const schema = { user, session, account, verification };

export const relations = defineRelations(schema, (r) => ({
  user: {
    sessions: r.many.session({ from: r.user.id, to: r.session.userId }),
    accounts: r.many.account({ from: r.user.id, to: r.account.userId }),
  },
  session: {
    user: r.one.user({ from: r.session.userId, to: r.user.id }),
  },
  account: {
    user: r.one.user({ from: r.account.userId, to: r.user.id }),
  },
}));
