import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from '@/modules/auth/domain/entities/parent-account';
import { AuthError, type AuthErrorCode } from '@/modules/auth/domain/errors/auth-error';

const AUTH_ERROR_COPY: Record<AuthErrorCode, string> = {
  INVALID_EMAIL: 'Adresse email invalide.',
  PASSWORD_TOO_SHORT: `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`,
  PASSWORD_TOO_LONG: `Le mot de passe doit contenir au plus ${MAX_PASSWORD_LENGTH} caractères.`,
  USER_ALREADY_EXISTS: 'Un compte existe déjà avec cet email.',
  INVALID_EMAIL_OR_PASSWORD: 'Email ou mot de passe incorrect.',
  HOUSEHOLD_NAME_REQUIRED: 'Le nom du foyer est requis.',
  FIRST_NAME_REQUIRED: 'Le prénom est requis.',
};

/** E.g. "Au moins 8 caractères", shown under the password field. */
export const PASSWORD_LENGTH_HINT = `Au moins ${MIN_PASSWORD_LENGTH} caractères`;

/** User-facing copy for an auth error; `fallback` for anything unexpected. */
export function authErrorMessage(error: unknown, fallback: string): string {
  return error instanceof AuthError ? AUTH_ERROR_COPY[error.code] : fallback;
}
