/** Codes the HTTP adapter will map API responses onto (409 on `unique(child_id, date)`). */
export type JournalErrorCode = 'ENTRY_ALREADY_EXISTS';

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
