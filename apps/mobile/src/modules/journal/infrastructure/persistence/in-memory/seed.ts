import type { JournalEntry } from '@/modules/journal/domain/entities/journal-entry';

export const SEED_PHOTO_URI = 'memory://photo-placeholder';

const LEA_ID = 'child-lea';

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(20, 15, 0, 0);
  return date;
}

export const seedJournalEntries: readonly JournalEntry[] = [
  {
    id: 'entry-1',
    childId: LEA_ID,
    emotionId: 'fier',
    prideText: "J'ai aidé mon copain à faire ses maths et il a réussi tout seul après.",
    photoUri: SEED_PHOTO_URI,
    createdAt: daysAgo(0),
  },
  {
    id: 'entry-2',
    childId: LEA_ID,
    emotionId: 'joyeux',
    prideText: 'On a fait un gâteau au chocolat avec maman pour le goûter.',
    photoUri: SEED_PHOTO_URI,
    createdAt: daysAgo(1),
  },
  {
    id: 'entry-3',
    childId: LEA_ID,
    emotionId: 'calme',
    prideText: 'On a lu trois histoires avant de dormir, blotti dans le canapé.',
    photoUri: SEED_PHOTO_URI,
    createdAt: daysAgo(2),
  },
  {
    id: 'entry-4',
    childId: LEA_ID,
    emotionId: 'fier',
    prideText: "J'ai réussi à faire du vélo sans les petites roues.",
    photoUri: SEED_PHOTO_URI,
    createdAt: daysAgo(4),
  },
  {
    id: 'entry-5',
    childId: LEA_ID,
    emotionId: 'joyeux',
    prideText: 'On a construit une cabane géante dans le salon.',
    photoUri: SEED_PHOTO_URI,
    createdAt: daysAgo(5),
  },
];
