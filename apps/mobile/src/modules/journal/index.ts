/**
 * Public API of the journal module: what other modules are allowed to
 * import. Never import a `@/modules/journal/domain/**` or
 * `@/modules/journal/infrastructure/**` path from another module (see AGENTS.md).
 */
export { CompleteEveningRitual } from '@/modules/journal/application/use-cases/complete-evening-ritual';
export { GetEveningStreak } from '@/modules/journal/application/use-cases/get-evening-streak';
export { GetJournalEntries } from '@/modules/journal/application/use-cases/get-journal-entries';
export { ListEmotions } from '@/modules/journal/application/use-cases/list-emotions';
export type { JournalEntry } from '@/modules/journal/domain/entities/journal-entry';
export type { Emotion, EmotionId } from '@/modules/journal/domain/entities/emotion';
