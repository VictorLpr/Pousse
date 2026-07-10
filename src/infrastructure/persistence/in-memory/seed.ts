import type { Child } from '@/domain/entities/child';
import type { JournalEntry } from '@/domain/entities/journal-entry';
import type { Trophy } from '@/domain/entities/trophy';
import type { WeeklyChallenge } from '@/domain/entities/weekly-challenge';

export const SEED_PHOTO_URI = 'memory://photo-placeholder';

const LEA_ID = 'child-lea';
const TOM_ID = 'child-tom';

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(20, 15, 0, 0);
  return date;
}

export const seedChildren: readonly Child[] = [
  {
    id: LEA_ID,
    firstName: 'Léa',
    ageRange: '7-9',
    reminder: { time: '20:00', enabled: true },
    streakInEvenings: 3,
  },
  {
    id: TOM_ID,
    firstName: 'Tom',
    ageRange: '4-6',
    reminder: { time: '20:00', enabled: true },
    streakInEvenings: 0,
  },
];

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

export const seedWeeklyChallenges: readonly WeeklyChallenge[] = [
  {
    id: 'challenge-lea',
    childId: LEA_ID,
    title: "Fais un compliment à quelqu'un que tu aimes",
    completedTogether: false,
  },
  {
    id: 'challenge-tom',
    childId: TOM_ID,
    title: 'Range trois jouets avant de dormir',
    completedTogether: false,
  },
];

export const seedTrophies: readonly Trophy[] = [
  { id: 'entraide', childId: LEA_ID, name: 'Entraide', status: 'earned' },
  { id: 'creatif', childId: LEA_ID, name: 'Créatif', status: 'earned' },
  { id: 'gentillesse', childId: LEA_ID, name: 'Gentillesse', status: 'earned' },
  { id: 'courage', childId: LEA_ID, name: 'Courage', status: 'earned' },
  { id: 'locked-1', childId: LEA_ID, name: 'À venir', status: 'locked' },
  { id: 'locked-2', childId: LEA_ID, name: 'À venir', status: 'locked' },
  { id: 'tom-locked-1', childId: TOM_ID, name: 'À venir', status: 'locked' },
  { id: 'tom-locked-2', childId: TOM_ID, name: 'À venir', status: 'locked' },
];
