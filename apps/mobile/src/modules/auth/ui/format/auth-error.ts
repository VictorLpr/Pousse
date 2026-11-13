import { MAX_CHILD_AGE, MIN_CHILD_AGE } from '@/modules/auth/domain/entities/child';
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from '@/modules/auth/domain/entities/parent-account';
import { AuthError, type AuthErrorCode } from '@/modules/auth/domain/errors/auth-error';

const AUTH_ERROR_COPY: Record<AuthErrorCode, string> = {
  INVALID_EMAIL: 'Adresse email invalide.',
  PASSWORD_TOO_SHORT: `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`,
  PASSWORD_TOO_LONG: `Le mot de passe doit contenir au plus ${MAX_PASSWORD_LENGTH} caractères.`,
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: 'Un compte existe déjà avec cet email.',
  INVALID_EMAIL_OR_PASSWORD: 'Email ou mot de passe incorrect.',
  FIRST_NAME_REQUIRED: 'Le prénom est requis.',
  BIRTH_DATE_INVALID: "Cette date de naissance n'existe pas.",
  CHILD_AGE_OUT_OF_RANGE: `Pousse accompagne les enfants de ${MIN_CHILD_AGE} à ${MAX_CHILD_AGE} ans : vérifie la date de naissance.`,
  GUARDIAN_ATTESTATION_REQUIRED:
    'Coche la case pour confirmer que tu es son parent ou son représentant légal.',
  POLICY_VERSION_INVALID: 'Version de la politique de confidentialité inconnue.',
};

/** E.g. "Au moins 8 caractères", shown under the password field. */
export const PASSWORD_LENGTH_HINT = `Au moins ${MIN_PASSWORD_LENGTH} caractères`;

/** Shown under the birth date fields. */
export const CHILD_AGE_HINT = `Pousse accompagne les enfants de ${MIN_CHILD_AGE} à ${MAX_CHILD_AGE} ans`;

/** User-facing copy for an auth error; `fallback` for anything unexpected. */
export function authErrorMessage(error: unknown, fallback: string): string {
  return error instanceof AuthError ? AUTH_ERROR_COPY[error.code] : fallback;
}
