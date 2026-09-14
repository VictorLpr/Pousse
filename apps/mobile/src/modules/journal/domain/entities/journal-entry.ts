import type { EmotionId } from './emotion';

export interface JournalEntry {
  readonly id: string;
  readonly childId: string;
  readonly emotionId: EmotionId;
  readonly prideText: string;
  readonly photoUri: string | null;
  readonly createdAt: Date;
}
