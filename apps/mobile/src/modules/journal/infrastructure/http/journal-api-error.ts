import { JournalError, type JournalErrorCode } from '@/modules/journal/domain/errors/journal-error';
import { ApiError } from '@/shared/infrastructure/http/api-error';

/** The API's journal codes the screens have display copy for. */
const JOURNAL_ERROR_CODES: ReadonlySet<string> = new Set<JournalErrorCode>([
  'ENTRY_ALREADY_EXISTS',
  'DATE_OUT_OF_RANGE',
  'UNKNOWN_EMOTION',
  'CHILD_NOT_FOUND',
  'VALIDATION_FAILED',
]);

/**
 * A journal code from the API becomes a `JournalError`; anything else (no
 * network, timeout, expired session…) is returned as is and reaches the
 * screens' fallback copy.
 */
export function journalErrorOf(error: unknown): unknown {
  if (error instanceof ApiError && JOURNAL_ERROR_CODES.has(error.code)) {
    return new JournalError(error.code as JournalErrorCode, error.message);
  }
  return error;
}
