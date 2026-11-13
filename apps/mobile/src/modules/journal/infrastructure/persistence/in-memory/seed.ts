import type { Emotion } from '@/modules/journal/domain/entities/emotion';
import { type JournalEntry, localDayOf } from '@/modules/journal/domain/entities/journal-entry';
import { entryPhotoOf } from '@/modules/journal/domain/entities/photo';
import { PLACEHOLDER_PHOTO } from '@/modules/journal/infrastructure/device/placeholder-photo-picker';

/** The API's emotion catalog (`apps/api/src/shared/db/catalogs/emotions.ts`), in display order. */
export const seedEmotions: readonly Emotion[] = [
  { code: 'happy', label: 'joyeux' },
  { code: 'proud', label: 'fier' },
  { code: 'calm', label: 'calme' },
  { code: 'surprised', label: 'surpris' },
  { code: 'sad', label: 'triste' },
  { code: 'angry', label: 'fâché' },
];

/** The demo memories' photo, the same stand-in the ritual's photo step picks. */
const SEED_PHOTO = entryPhotoOf(PLACEHOLDER_PHOTO);

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
    emotionCode: 'proud',
    text: "J'ai aidé mon copain à faire ses maths et il a réussi tout seul après.",
    photo: SEED_PHOTO,
    ...eveningOf(1),
  },
  {
    id: 'entry-2',
    childId: LEA_ID,
    emotionCode: 'happy',
    text: 'On a fait un gâteau au chocolat avec maman pour le goûter.',
    photo: SEED_PHOTO,
    ...eveningOf(2),
  },
  {
    id: 'entry-3',
    childId: LEA_ID,
    emotionCode: 'calm',
    text: 'On a lu trois histoires avant de dormir, blotti dans le canapé.',
    photo: SEED_PHOTO,
    ...eveningOf(3),
  },
  {
    id: 'entry-4',
    childId: LEA_ID,
    emotionCode: 'proud',
    text: "J'ai réussi à faire du vélo sans les petites roues.",
    photo: SEED_PHOTO,
    ...eveningOf(5),
  },
  {
    id: 'entry-5',
    childId: LEA_ID,
    emotionCode: 'happy',
    text: 'On a construit une cabane géante dans le salon.',
    photo: SEED_PHOTO,
    ...eveningOf(6),
  },
];
