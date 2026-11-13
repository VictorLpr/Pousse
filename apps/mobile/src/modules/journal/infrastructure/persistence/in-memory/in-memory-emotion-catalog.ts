import type { Emotion } from '@/modules/journal/domain/entities/emotion';
import type { EmotionCatalog } from '@/modules/journal/domain/ports/emotion-catalog';

export class InMemoryEmotionCatalog implements EmotionCatalog {
  constructor(private readonly emotions: readonly Emotion[]) {}

  async list(): Promise<Emotion[]> {
    return [...this.emotions];
  }
}
