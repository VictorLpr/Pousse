import type { Emotion } from '@/modules/journal/domain/entities/emotion';
import type { EmotionCatalog } from '@/modules/journal/domain/ports/emotion-catalog';

export class ListEmotions {
  constructor(private readonly catalog: EmotionCatalog) {}

  execute(): Promise<Emotion[]> {
    return this.catalog.list();
  }
}
