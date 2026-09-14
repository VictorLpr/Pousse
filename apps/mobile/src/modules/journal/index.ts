/**
 * API publique du module journal : ce que les autres modules ont le droit
 * d'importer. Ne jamais importer un chemin `@/modules/journal/domain/**` ou
 * `@/modules/journal/infrastructure/**` depuis un autre module (voir AGENTS.md).
 */
export { CompleteEveningRitual } from '@/modules/journal/application/use-cases/complete-evening-ritual';
export { GetJournalEntries } from '@/modules/journal/application/use-cases/get-journal-entries';
export type { JournalEntry } from '@/modules/journal/domain/entities/journal-entry';
export { EMOTIONS, getEmotion } from '@/modules/journal/domain/entities/emotion';
export type { Emotion, EmotionId } from '@/modules/journal/domain/entities/emotion';
