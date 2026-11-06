import type { emotion } from '#/shared/db/schema.js';

/**
 * Emotion catalog, in display order: rows are inserted in this order, and
 * the API lists them by `id`. A new emotion goes at the end. Codes are
 * stable English keys; labels are French display content.
 */
export const EMOTIONS: readonly (typeof emotion.$inferInsert)[] = [
  { code: 'happy', label: 'joyeux' },
  { code: 'proud', label: 'fier' },
  { code: 'calm', label: 'calme' },
  { code: 'surprised', label: 'surpris' },
  { code: 'sad', label: 'triste' },
  { code: 'angry', label: 'fâché' },
];
