import type { Trophy } from '@/modules/challenges/domain/entities/trophy';
import type { WeeklyChallenge } from '@/modules/challenges/domain/entities/weekly-challenge';

const LEA_ID = 'child-lea';
const TOM_ID = 'child-tom';

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

/** Titles the fake backend draws from when a child has no challenge yet. */
export const challengeTitlePool: readonly string[] = [
  "Fais un compliment à quelqu'un que tu aimes",
  'Range trois jouets avant de dormir',
  'Aide à mettre la table ce soir',
  'Raconte une histoire drôle à ta famille',
];

export const seedTrophies: readonly Trophy[] = [
  { id: 'teamwork', childId: LEA_ID, name: 'Entraide', status: 'earned' },
  { id: 'creative', childId: LEA_ID, name: 'Créatif', status: 'earned' },
  { id: 'kindness', childId: LEA_ID, name: 'Gentillesse', status: 'earned' },
  { id: 'courage', childId: LEA_ID, name: 'Courage', status: 'earned' },
];
