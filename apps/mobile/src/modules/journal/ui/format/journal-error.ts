import { JournalError, type JournalErrorCode } from '@/modules/journal/domain/errors/journal-error';

const JOURNAL_ERROR_COPY: Record<JournalErrorCode, string> = {
  ENTRY_ALREADY_EXISTS: 'Le moment de ce soir est déjà gardé dans le journal. À demain !',
};

/** User-facing copy for a journal error; `fallback` for anything unexpected. */
export function journalErrorMessage(error: unknown, fallback: string): string {
  return error instanceof JournalError ? JOURNAL_ERROR_COPY[error.code] : fallback;
}
