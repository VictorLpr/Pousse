/**
 * Error types shared by every module. No business logic here (ADR-0006):
 * only generic error classes any module can reuse.
 *
 * Each one carries a stable English `code` (e.g. `CHILD_NOT_FOUND`) that the
 * mobile client maps to its own display copy, and the HTTP status the error
 * handler answers with (`error-handler.ts`).
 */
export class AppError extends Error {
  readonly code: string;
  readonly statusCode: number;

  constructor(code: string, message: string, statusCode: number) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

/** The resource doesn't exist, or belongs to another parent. */
export class NotFoundError extends AppError {
  constructor(code: string, message: string) {
    super(code, message, 404);
    this.name = 'NotFoundError';
  }
}

/** Well-formed input refused by a business rule. */
export class ValidationError extends AppError {
  constructor(code: string, message: string) {
    super(code, message, 422);
    this.name = 'ValidationError';
  }
}

/** No valid session. */
export class UnauthorizedError extends AppError {
  constructor(message = 'A valid session is required') {
    super('UNAUTHORIZED', message, 401);
    this.name = 'UnauthorizedError';
  }
}
