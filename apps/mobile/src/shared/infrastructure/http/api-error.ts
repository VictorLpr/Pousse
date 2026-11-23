/**
 * Codes the client raises itself, when no `{ code, message }` body came back
 * from the API: the request never reached it, took too long, or got an
 * answer that isn't the API's JSON (e.g. an HTML page from a proxy).
 */
export const CLIENT_ERROR_CODES = {
  networkUnavailable: 'NETWORK_UNAVAILABLE',
  timeout: 'TIMEOUT',
  unexpectedResponse: 'UNEXPECTED_RESPONSE',
} as const;

/** Status of an `ApiError` raised before any HTTP response came back. */
export const NO_RESPONSE_STATUS = 0;

/**
 * A failed API call, carrying the API's stable English `code`
 * (`CHILD_NOT_FOUND`, `INVALID_EMAIL_OR_PASSWORD`…) or one of
 * `CLIENT_ERROR_CODES`. Module HTTP adapters translate the codes they know
 * into their domain error (`AuthError`, `JournalError`); the UI never shows
 * `message`, which is the API's English text, kept for logs.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
