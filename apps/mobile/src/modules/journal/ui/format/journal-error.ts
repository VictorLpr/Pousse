import { JournalError, type JournalErrorCode } from '@/modules/journal/domain/errors/journal-error';

const JOURNAL_ERROR_COPY: Record<JournalErrorCode, string> = {
  ENTRY_ALREADY_EXISTS: 'Le moment de ce soir est déjà gardé dans le journal. À demain !',
  DATE_OUT_OF_RANGE: 'Ce rituel a commencé il y a trop longtemps. Recommencez-le depuis l’accueil.',
  UNKNOWN_EMOTION: 'Cette émotion n’existe plus. Revenez en arrière pour en choisir une autre.',
  CHILD_NOT_FOUND: 'Ce profil enfant est introuvable. Revenez à l’accueil.',
  VALIDATION_FAILED: 'Ce moment ne peut pas être gardé tel quel. Vérifiez le texte et la photo.',
};

/** User-facing copy for a journal error; `fallback` for anything unexpected. */
export function journalErrorMessage(error: unknown, fallback: string): string {
  return error instanceof JournalError ? JOURNAL_ERROR_COPY[error.code] : fallback;
}
