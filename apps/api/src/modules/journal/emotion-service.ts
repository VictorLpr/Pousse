import type { EmotionRepository, EmotionRow } from '#/modules/journal/emotion-repository.js';

export interface EmotionService {
  /** The emotion catalog a child picks from when writing a memory. */
  listEmotions(): Promise<EmotionRow[]>;
}

export function createEmotionService(repository: EmotionRepository): EmotionService {
  return {
    listEmotions: () => repository.listAll(),
  };
}
