import type { Emotion, EmotionCode } from '@/modules/journal/domain/entities/emotion';

export type EmotionCatalogState =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly emotions: readonly Emotion[] }
  | { readonly status: 'failed' };

const UNKNOWN_EMOTION_LABEL = 'émotion';

/**
 * The emotion's label from the loaded catalog, e.g. "joyeux"; « émotion » for
 * a code the catalog does not know or when it could not load; null while it
 * loads, so nothing flickers.
 */
export function emotionLabel(catalog: EmotionCatalogState, code: EmotionCode): string | null {
  switch (catalog.status) {
    case 'loading':
      return null;
    case 'failed':
      return UNKNOWN_EMOTION_LABEL;
    case 'ready':
      return (
        catalog.emotions.find((emotion) => emotion.code === code)?.label ?? UNKNOWN_EMOTION_LABEL
      );
  }
}
