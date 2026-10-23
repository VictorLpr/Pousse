import { defineRelations, sql } from 'drizzle-orm';
import {
  boolean,
  check,
  date,
  index,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  time,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

/**
 * Physical schema (ADR-0002, ADR-0005): single source of truth, migrations
 * are generated from this file by drizzle-kit
 * (`npm run db:generate -w apps/api`). The logical model it implements is
 * documented in docs/data-model/data-model.html.
 *
 * The `user`, `session`, `account` and `verification` tables are the ones
 * BetterAuth expects (ADR-0003): their column names don't change without
 * mirroring the change in `modules/auth/auth.ts`. The `user` table stands in
 * for the logical model's `PARENT`; the hashed password lives in
 * `account.password`.
 *
 * Every business table hangs off `user` through `child`, with cascading
 * deletes: deleting a parent account erases all of its children's data
 * (right to erasure). Catalog tables (`emotion`, `challenge`, `badge`) are
 * never deleted from while referenced: a challenge is retired with
 * `active = false` (ADR-0005).
 *
 * Rules that depend on the current time or on a row count stay in the
 * service layer (ADR-0005): child aged 4 to 12 at creation, entry editable
 * for 24 hours, three challenges offered per week, challenge matching the
 * child's age range.
 */

export const ageRange = pgEnum('age_range', ['4-7', '8-12', '4-12']);

export const challengeCategory = pgEnum('challenge_category', [
  'helping',
  'creativity',
  'learning',
  'politeness',
]);

export const childChallengeStatus = pgEnum('child_challenge_status', [
  'proposed',
  'chosen',
  'completed',
  'abandoned',
  'expired',
]);

export const prideLetterStatus = pgEnum('pride_letter_status', ['pending', 'generated', 'failed']);

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

/**
 * A child profile. Age and age range are computed from `birthDate` at read
 * time, never stored; the streak of evenings is counted from the journal.
 */
export const child = pgTable(
  'child',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    parentId: uuid('parent_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    /** The only identifying data kept about the child (data minimization). */
    firstName: varchar('first_name', { length: 50 }).notNull(),
    birthDate: date('birth_date').notNull(),
    /** Code of a built-in avatar, never an uploaded picture (ADR-0004). */
    avatar: varchar('avatar', { length: 30 }),
    /** Evening reminder settings, kept per child even while no notification is sent (ADR-0010). */
    reminderTime: time('reminder_time').notNull().default('20:00'),
    reminderEnabled: boolean('reminder_enabled').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('child_parent_id_idx').on(table.parentId),
    check('child_first_name_not_blank', sql`char_length(trim(${table.firstName})) > 0`),
  ],
);

/**
 * Proof of parental consent, one per child. Never updated: the consent
 * repository declares no update method (ADR-0005).
 */
export const consent = pgTable(
  'consent',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    childId: uuid('child_id')
      .notNull()
      .unique()
      .references(() => child.id, { onDelete: 'cascade' }),
    givenAt: timestamp('given_at', { withTimezone: true }).notNull().defaultNow(),
    policyVersion: varchar('policy_version', { length: 10 }).notNull(),
    guardianAttested: boolean('guardian_attested').notNull(),
  },
  (table) => [check('consent_guardian_attested', sql`${table.guardianAttested} = true`)],
);

/** Emotion catalog. Rows may be in French (display content); codes stay in English. */
export const emotion = pgTable('emotion', {
  id: smallint('id').primaryKey().generatedAlwaysAsIdentity(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  label: varchar('label', { length: 30 }).notNull(),
});

/**
 * The daily memory. An entry is only stored once parent and child have
 * validated it together; the draft lives on the device.
 */
export const journalEntry = pgTable(
  'journal_entry',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    childId: uuid('child_id')
      .notNull()
      .references(() => child.id, { onDelete: 'cascade' }),
    emotionId: smallint('emotion_id')
      .notNull()
      .references(() => emotion.id),
    /** The family's local day the memory belongs to. */
    date: date('date').notNull(),
    text: varchar('text', { length: 500 }).notNull(),
    /** Start of the 24-hour edit window. */
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    unique('journal_entry_child_id_date_unique').on(table.childId, table.date),
    check('journal_entry_text_not_blank', sql`char_length(trim(${table.text})) > 0`),
  ],
);

/**
 * Marks that an entry has a photo. The picture itself never leaves the
 * device (ADR-0004): only its file name is kept, never an absolute path.
 */
export const photo = pgTable(
  'photo',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    journalEntryId: uuid('journal_entry_id')
      .notNull()
      .unique()
      .references(() => journalEntry.id, { onDelete: 'cascade' }),
    fileName: varchar('file_name', { length: 255 }).notNull(),
    mimeType: varchar('mime_type', { length: 30 }).notNull(),
  },
  (table) => [
    check(
      'photo_mime_type_allowed',
      sql`${table.mimeType} in ('image/jpeg', 'image/png', 'image/webp')`,
    ),
  ],
);

/** Challenge catalog. Title and description may be in French (display content). */
export const challenge = pgTable('challenge', {
  id: smallint('id').primaryKey().generatedAlwaysAsIdentity(),
  title: varchar('title', { length: 100 }).notNull(),
  description: varchar('description', { length: 300 }).notNull(),
  ageRange: ageRange('age_range').notNull(),
  category: challengeCategory('category').notNull(),
  /** Retires a challenge from the draw without losing the history that references it. */
  active: boolean('active').notNull().default(true),
});

/**
 * A challenge offered to a child for a given ISO week. Same challenge can
 * come back on a later week, hence the technical key and the
 * `(child, challenge, week)` candidate key.
 */
export const childChallenge = pgTable(
  'child_challenge',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    childId: uuid('child_id')
      .notNull()
      .references(() => child.id, { onDelete: 'cascade' }),
    challengeId: smallint('challenge_id')
      .notNull()
      .references(() => challenge.id),
    /** Monday of the ISO week; the week ends six days later. */
    weekStart: date('week_start').notNull(),
    status: childChallengeStatus('status').notNull().default('proposed'),
    chosenAt: timestamp('chosen_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (table) => [
    unique('child_challenge_child_id_challenge_id_week_start_unique').on(
      table.childId,
      table.challengeId,
      table.weekStart,
    ),
    uniqueIndex('child_challenge_one_taken_per_week_idx')
      .on(table.childId, table.weekStart)
      .where(sql`${table.status} in ('chosen', 'completed')`),
    index('child_challenge_challenge_id_idx').on(table.challengeId),
    check('child_challenge_week_start_is_monday', sql`extract(isodow from ${table.weekStart}) = 1`),
    check(
      'child_challenge_dates_match_status',
      sql`(${table.status} = 'proposed' and ${table.chosenAt} is null and ${table.completedAt} is null)
        or (${table.status} in ('chosen', 'abandoned') and ${table.chosenAt} is not null and ${table.completedAt} is null)
        or (${table.status} = 'completed' and ${table.chosenAt} is not null and ${table.completedAt} is not null
          and ${table.completedAt} >= ${table.chosenAt})
        or (${table.status} = 'expired' and ${table.completedAt} is null)`,
    ),
  ],
);

/**
 * Badge catalog. Label and description may be in French (display content);
 * the award conditions live in the challenges service, keyed by `code`.
 */
export const badge = pgTable('badge', {
  id: smallint('id').primaryKey().generatedAlwaysAsIdentity(),
  code: varchar('code', { length: 30 }).notNull().unique(),
  label: varchar('label', { length: 60 }).notNull(),
  description: varchar('description', { length: 200 }),
});

/** A badge earned by a child; the composite key awards it only once. */
export const badgeAward = pgTable(
  'badge_award',
  {
    childId: uuid('child_id')
      .notNull()
      .references(() => child.id, { onDelete: 'cascade' }),
    badgeId: smallint('badge_id')
      .notNull()
      .references(() => badge.id),
    awardedAt: timestamp('awarded_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.childId, table.badgeId] }),
    index('badge_award_badge_id_idx').on(table.badgeId),
  ],
);

/**
 * Monthly letter generated by an AI model. Only `anonymousId` is sent to the
 * model, never the child's first name.
 */
export const prideLetter = pgTable(
  'pride_letter',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    childId: uuid('child_id')
      .notNull()
      .references(() => child.id, { onDelete: 'cascade' }),
    /** First day of the month the letter covers. */
    month: date('month').notNull(),
    status: prideLetterStatus('status').notNull().default('pending'),
    content: text('content'),
    generatedAt: timestamp('generated_at', { withTimezone: true }),
    aiModel: varchar('ai_model', { length: 50 }),
    anonymousId: uuid('anonymous_id').notNull().unique().defaultRandom(),
  },
  (table) => [
    unique('pride_letter_child_id_month_unique').on(table.childId, table.month),
    check('pride_letter_month_is_first_day', sql`extract(day from ${table.month}) = 1`),
    check(
      'pride_letter_generated_has_content',
      sql`${table.status} <> 'generated'
        or (${table.content} is not null and ${table.generatedAt} is not null and ${table.aiModel} is not null)`,
    ),
  ],
);

export const schema = {
  user,
  session,
  account,
  verification,
  child,
  consent,
  emotion,
  journalEntry,
  photo,
  challenge,
  childChallenge,
  badge,
  badgeAward,
  prideLetter,
};

export const relations = defineRelations(schema, (r) => ({
  user: {
    sessions: r.many.session({ from: r.user.id, to: r.session.userId }),
    accounts: r.many.account({ from: r.user.id, to: r.account.userId }),
    children: r.many.child({ from: r.user.id, to: r.child.parentId }),
  },
  session: {
    user: r.one.user({ from: r.session.userId, to: r.user.id }),
  },
  account: {
    user: r.one.user({ from: r.account.userId, to: r.user.id }),
  },
  child: {
    parent: r.one.user({ from: r.child.parentId, to: r.user.id }),
    consent: r.one.consent({ from: r.child.id, to: r.consent.childId }),
    journalEntries: r.many.journalEntry({ from: r.child.id, to: r.journalEntry.childId }),
    challenges: r.many.childChallenge({ from: r.child.id, to: r.childChallenge.childId }),
    badgeAwards: r.many.badgeAward({ from: r.child.id, to: r.badgeAward.childId }),
    prideLetters: r.many.prideLetter({ from: r.child.id, to: r.prideLetter.childId }),
  },
  consent: {
    child: r.one.child({ from: r.consent.childId, to: r.child.id }),
  },
  journalEntry: {
    child: r.one.child({ from: r.journalEntry.childId, to: r.child.id }),
    emotion: r.one.emotion({ from: r.journalEntry.emotionId, to: r.emotion.id }),
    photo: r.one.photo({ from: r.journalEntry.id, to: r.photo.journalEntryId }),
  },
  photo: {
    journalEntry: r.one.journalEntry({ from: r.photo.journalEntryId, to: r.journalEntry.id }),
  },
  childChallenge: {
    child: r.one.child({ from: r.childChallenge.childId, to: r.child.id }),
    challenge: r.one.challenge({ from: r.childChallenge.challengeId, to: r.challenge.id }),
  },
  badgeAward: {
    child: r.one.child({ from: r.badgeAward.childId, to: r.child.id }),
    badge: r.one.badge({ from: r.badgeAward.badgeId, to: r.badge.id }),
  },
  prideLetter: {
    child: r.one.child({ from: r.prideLetter.childId, to: r.child.id }),
  },
}));
