import type { Emotion } from '../entities/emotion';

export interface EmotionCatalog {
  /** Every emotion a child can pick, in display order. */
  list(): Promise<Emotion[]>;
}
