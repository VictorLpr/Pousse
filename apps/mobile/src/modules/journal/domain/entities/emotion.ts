/** The emotion's stable English code, as the API returns it (`happy`, `proud`…). */
export type EmotionCode = string;

/** One entry of the emotion catalog, shaped like `GET /journal/emotions`. */
export interface Emotion {
  readonly code: EmotionCode;
  readonly label: string;
}
