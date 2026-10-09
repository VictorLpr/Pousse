export type EmotionId = 'happy' | 'proud' | 'calm' | 'surprised' | 'sad' | 'angry';

export interface Emotion {
  readonly id: EmotionId;
  readonly label: string;
}

export const EMOTIONS: readonly Emotion[] = [
  { id: 'happy', label: 'joyeux' },
  { id: 'proud', label: 'fier' },
  { id: 'calm', label: 'calme' },
  { id: 'surprised', label: 'surpris' },
  { id: 'sad', label: 'triste' },
  { id: 'angry', label: 'fâché' },
];

export function getEmotion(id: EmotionId): Emotion {
  const emotion = EMOTIONS.find((candidate) => candidate.id === id);
  if (!emotion) {
    throw new Error(`Unknown emotion: ${id}`);
  }
  return emotion;
}
