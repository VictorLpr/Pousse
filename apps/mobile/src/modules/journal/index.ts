/**
 * Public API of the journal module: what other modules are allowed to
 * import. Never import a `@/modules/journal/domain/**` or
 * `@/modules/journal/infrastructure/**` path from another module (see AGENTS.md).
 */
export { CompleteEveningRitual } from '@/modules/journal/application/use-cases/complete-evening-ritual';
export { GetJournalEntries } from '@/modules/journal/application/use-cases/get-journal-entries';
export type { JournalEntry } from '@/modules/journal/domain/entities/journal-entry';
export { EMOTIONS, getEmotion } from '@/modules/journal/domain/entities/emotion';
export type { Emotion, EmotionId } from '@/modules/journal/domain/entities/emotion';
