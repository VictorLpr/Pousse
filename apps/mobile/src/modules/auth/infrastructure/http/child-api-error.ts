import { AuthError, type AuthErrorCode } from '@/modules/auth/domain/errors/auth-error';
import { ApiError } from '@/shared/infrastructure/http/api-error';

/**
 * The fields of `POST /children` a screen can get wrong, and the code each
 * one's `VALIDATION_FAILED` stands for. The API's message names the field
 * first (`body/birthDate Invalid ISO date`), as Fastify formats schema errors.
 * `firstName` is left out: `CreateChildProfile` refuses an empty one before
 * the call, so the API only refuses it as too long, which has no copy.
 */
const INVALID_FIELD_CODES: readonly (readonly [string, AuthErrorCode])[] = [
  ['body/birthDate', 'BIRTH_DATE_INVALID'],
  ['body/consent/guardianAttested', 'GUARDIAN_ATTESTATION_REQUIRED'],
  ['body/consent/policyVersion', 'POLICY_VERSION_INVALID'],
];

/**
 * A `/children` failure the screens have copy for becomes an `AuthError`;
 * anything else is returned as it came, for their fallback copy.
 */
export function toChildError(error: unknown): unknown {
  if (!(error instanceof ApiError)) {
    return error;
  }
  if (error.code === 'CHILD_AGE_OUT_OF_RANGE') {
    return new AuthError(error.code, error.message);
  }
  if (error.code === 'VALIDATION_FAILED') {
    const match = INVALID_FIELD_CODES.find(([field]) => error.message.startsWith(`${field} `));
    if (match) {
      return new AuthError(match[1], error.message);
    }
  }
  return error;
}

/**
 * `/children/:id…` names no child of this parent: none with that id
 * (`CHILD_NOT_FOUND`), or an id that can't be one, refused before any lookup
 * (`VALIDATION_FAILED` on `params/id`).
 */
export function isUnknownChild(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.code === 'CHILD_NOT_FOUND' ||
      (error.code === 'VALIDATION_FAILED' && error.message.startsWith('params/id ')))
  );
}
