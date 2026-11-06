import { type JournalEntry, localDayOf } from '@/modules/journal/domain/entities/journal-entry';

export const SEED_PHOTO_URI = 'memory://photo-placeholder';

const LEA_ID = 'child-lea';

/** The ritual of `days` evenings ago, at 20:15. */
function eveningOf(days: number): Pick<JournalEntry, 'date' | 'createdAt'> {
  const createdAt = new Date();
  createdAt.setDate(createdAt.getDate() - days);
  createdAt.setHours(20, 15, 0, 0);
  return { date: localDayOf(createdAt), createdAt };
}

/** One entry per evening, starting yesterday so the demo can still run tonight's ritual. */
export const seedJournalEntries: readonly JournalEntry[] = [
  {
    id: 'entry-1',
    childId: LEA_ID,
    emotionId: 'proud',
    prideText: "J'ai aidé mon copain à faire ses maths et il a réussi tout seul après.",
    photoUri: SEED_PHOTO_URI,
    ...eveningOf(1),
  },
  {
    id: 'entry-2',
    childId: LEA_ID,
    emotionId: 'happy',
    prideText: 'On a fait un gâteau au chocolat avec maman pour le goûter.',
    photoUri: SEED_PHOTO_URI,
    ...eveningOf(2),
  },
  {
    id: 'entry-3',
    childId: LEA_ID,
    emotionId: 'calm',
    prideText: 'On a lu trois histoires avant de dormir, blotti dans le canapé.',
    photoUri: SEED_PHOTO_URI,
    ...eveningOf(3),
  },
  {
    id: 'entry-4',
    childId: LEA_ID,
    emotionId: 'proud',
    prideText: "J'ai réussi à faire du vélo sans les petites roues.",
    photoUri: SEED_PHOTO_URI,
    ...eveningOf(5),
  },
  {
    id: 'entry-5',
    childId: LEA_ID,
    emotionId: 'happy',
    prideText: 'On a construit une cabane géante dans le salon.',
    photoUri: SEED_PHOTO_URI,
    ...eveningOf(6),
  },
];
