import {
  ChallengeError,
  type ChallengeErrorCode,
} from '@/modules/challenges/domain/errors/challenge-error';

const CHALLENGE_ERROR_COPY: Record<ChallengeErrorCode, string> = {
  CHALLENGE_ALREADY_CHOSEN: 'Un défi est déjà choisi pour cette semaine.',
  INVALID_CHALLENGE_TRANSITION: 'Ce défi ne peut plus changer. Revenez sur la page des défis.',
  DATE_OUT_OF_RANGE: 'La date de l’appareil semble décalée. Vérifiez-la, puis réessayez.',
  CHILD_NOT_FOUND: 'Ce profil enfant est introuvable. Revenez à l’accueil.',
  CHILD_CHALLENGE_NOT_FOUND: 'Ce défi est introuvable. Revenez sur la page des défis.',
  VALIDATION_FAILED: 'Les défis de la semaine ne peuvent pas s’afficher. Réessayez.',
};

/** User-facing copy for a challenge error; `fallback` for anything unexpected. */
export function challengeErrorMessage(error: unknown, fallback: string): string {
  return error instanceof ChallengeError ? CHALLENGE_ERROR_COPY[error.code] : fallback;
}
