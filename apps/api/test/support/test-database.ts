import { afterAll, afterEach, beforeAll, beforeEach } from '@jest/globals';
import { TransactionRollbackError } from 'drizzle-orm';

import { createDbClient, type Db } from '#/shared/db/client.js';

type Transaction = Parameters<Parameters<Db['transaction']>[0]>[0];

/**
 * Wraps each test of the calling file in a transaction rolled back at the
 * end (ADR-0007): no test sees another one's rows, and the schema is never
 * recreated.
 *
 * The returned getter gives the transaction to pass to `buildApp` as its
 * database. Transactions opened by the code under test (BetterAuth's adapter
 * opens some) become savepoints inside it, so nothing they commit survives
 * the rollback.
 */
export function useTestDatabase(): () => Db {
  let pool: Db;
  let transaction: Transaction | undefined;
  let release: () => void = () => {};
  let finished: Promise<void> = Promise.resolve();

  beforeAll(() => {
    const url = process.env.TEST_DATABASE_URL;
    if (!url) throw new Error('TEST_DATABASE_URL is not set: run the tests through Jest');
    pool = createDbClient(url);
  });

  afterAll(async () => {
    await pool.$client.end();
  });

  beforeEach(async () => {
    const released = new Promise<void>((resolve) => (release = resolve));
    const opened = new Promise<Transaction>((resolve) => {
      finished = pool
        .transaction(async (tx) => {
          resolve(tx);
          await released;
          tx.rollback();
        })
        .catch((error: unknown) => {
          if (!(error instanceof TransactionRollbackError)) throw error;
        });
    });
    // `finished` rejects if the transaction can't be opened.
    transaction = await Promise.race([opened, finished.then(() => undefined)]);
  });

  afterEach(async () => {
    release();
    await finished;
    transaction = undefined;
  });

  return () => {
    if (!transaction) throw new Error('No test transaction: call this getter inside a test');
    // A transaction exposes the same query API as the pool; only `$client`
    // is missing, and the application never uses it (`server.ts` alone
    // closes the pool).
    return transaction as unknown as Db;
  };
}
