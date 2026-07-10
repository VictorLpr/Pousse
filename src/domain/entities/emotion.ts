export type EmotionId = 'joyeux' | 'fier' | 'calme' | 'surpris' | 'triste' | 'fache';

export interface Emotion {
  readonly id: EmotionId;
  readonly label: string;
}

export const EMOTIONS: readonly Emotion[] = [
  { id: 'joyeux', label: 'joyeux' },
  { id: 'fier', label: 'fier' },
  { id: 'calme', label: 'calme' },
  { id: 'surpris', label: 'surpris' },
  { id: 'triste', label: 'triste' },
  { id: 'fache', label: 'fâché' },
];

export function getEmotion(id: EmotionId): Emotion {
  const emotion = EMOTIONS.find((candidate) => candidate.id === id);
  if (!emotion) {
    throw new Error(`Émotion inconnue : ${id}`);
  }
  return emotion;
}
