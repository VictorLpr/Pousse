import type { Emotion } from '@/modules/journal/domain/entities/emotion';
import type { EmotionCatalog } from '@/modules/journal/domain/ports/emotion-catalog';
import type { HttpClient } from '@/shared/infrastructure/http/http-client';

/** The emotion catalog on the API (`GET /journal/emotions`, public), already in display order. */
export class HttpEmotionCatalog implements EmotionCatalog {
  constructor(private readonly http: HttpClient) {}

  list(): Promise<Emotion[]> {
    return this.http.get<Emotion[]>('/journal/emotions');
  }
}
