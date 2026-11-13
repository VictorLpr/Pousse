import { JOURNAL_TEXT_MAX_LENGTH } from '@/modules/journal/domain/entities/journal-entry';

export interface TextCounter {
  /** Shown under the input, e.g. "42 / 500". */
  readonly display: string;
  /** Read by screen readers, e.g. "42 caractères sur 500". */
  readonly accessibilityLabel: string;
}

/** How much of the memory's room is used. */
export function textCounter(length: number): TextCounter {
  return {
    display: `${length} / ${JOURNAL_TEXT_MAX_LENGTH}`,
    accessibilityLabel: `${length} caractère${length > 1 ? 's' : ''} sur ${JOURNAL_TEXT_MAX_LENGTH}`,
  };
}
