/**
 * The API's journal error codes, so the HTTP adapter can map responses onto
 * the same errors: 409 `ENTRY_ALREADY_EXISTS` (one entry per child per day),
 * 422 `DATE_OUT_OF_RANGE` / `UNKNOWN_EMOTION`, 404 `CHILD_NOT_FOUND`, and
 * 400 `VALIDATION_FAILED` for a blank or too long text or a bad photo.
 */
export type JournalErrorCode =
  | 'ENTRY_ALREADY_EXISTS'
  | 'DATE_OUT_OF_RANGE'
  | 'UNKNOWN_EMOTION'
  | 'CHILD_NOT_FOUND'
  | 'VALIDATION_FAILED';

/** Business error the UI turns into display copy through its `code`. */
export class JournalError extends Error {
  constructor(
    readonly code: JournalErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'JournalError';
  }
}
