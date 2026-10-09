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

export const seedTrophies: readonly Trophy[] = [
  { id: 'teamwork', childId: LEA_ID, name: 'Entraide', status: 'earned' },
  { id: 'creative', childId: LEA_ID, name: 'Créatif', status: 'earned' },
  { id: 'kindness', childId: LEA_ID, name: 'Gentillesse', status: 'earned' },
  { id: 'courage', childId: LEA_ID, name: 'Courage', status: 'earned' },
  { id: 'locked-1', childId: LEA_ID, name: 'À venir', status: 'locked' },
  { id: 'locked-2', childId: LEA_ID, name: 'À venir', status: 'locked' },
  { id: 'tom-locked-1', childId: TOM_ID, name: 'À venir', status: 'locked' },
  { id: 'tom-locked-2', childId: TOM_ID, name: 'À venir', status: 'locked' },
];
