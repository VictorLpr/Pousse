import type { Challenge } from '@/modules/challenges/domain/entities/challenge';
import type { ChildChallenge } from '@/modules/challenges/domain/entities/child-challenge';
import type { Trophy } from '@/modules/challenges/domain/entities/trophy';
import type {
  CatalogChallenge,
  StoredChildChallenge,
} from '@/modules/challenges/infrastructure/persistence/in-memory/in-memory-child-challenge-repository';
import { localDayOf } from '@/modules/journal';
import { mondayOf, previousDay } from '@/shared/infrastructure/time/calendar-day';

const LEA_ID = 'child-lea';

/** Demo catalog: three challenges per age range, and a retired one the draw must skip. */
export const seedChallengeCatalog: readonly CatalogChallenge[] = [
  {
    code: 'compliment_loved_one',
    title: 'Faire un compliment',
    description: "Dis quelque chose de gentil à quelqu'un que tu aimes.",
    category: 'politeness',
    ageRange: '4-7',
    active: true,
  },
  {
    code: 'tidy_three_toys',
    title: 'Ranger trois jouets',
    description: 'Avant de dormir, range trois jouets à leur place.',
    category: 'helping',
    ageRange: '4-7',
    active: true,
  },
  {
    code: 'draw_your_day',
    title: 'Dessiner sa journée',
    description: 'Dessine le meilleur moment de ta journée et montre-le à ta famille.',
    category: 'creativity',
    ageRange: '4-7',
    active: true,
  },
  {
    code: 'set_the_table',
    title: 'Mettre la table',
    description: "Mets la table pour toute la famille, sans qu'on te le demande.",
    category: 'helping',
    ageRange: '8-12',
    active: true,
  },
  {
    code: 'learn_a_word',
    title: 'Apprendre un mot nouveau',
    description: 'Trouve un mot que tu ne connaissais pas et explique-le pendant le dîner.',
    category: 'learning',
    ageRange: '8-12',
    active: true,
  },
  {
    code: 'thank_you_note',
    title: 'Écrire un mot de merci',
    description: "Écris un petit mot pour remercier quelqu'un qui t'a aidé.",
    category: 'politeness',
    ageRange: '8-12',
    active: true,
  },
  {
    code: 'funny_story',
    title: 'Raconter une histoire drôle',
    description: 'Invente ou raconte une histoire qui fera rire toute la famille.',
    category: 'creativity',
    ageRange: '4-12',
    active: true,
  },
  {
    code: 'help_cook',
    title: 'Aider à cuisiner',
    description: 'Aide à préparer une partie du repas du soir.',
    category: 'helping',
    ageRange: '4-12',
    active: true,
  },
  {
    code: 'say_thank_you',
    title: 'Dire merci',
    description: "Pense à dire merci trois fois aujourd'hui, et compte-les ensemble.",
    category: 'politeness',
    ageRange: '4-12',
    active: true,
  },
  {
    code: 'water_the_plants',
    title: 'Arroser les plantes',
    description: 'Arrose les plantes de la maison avec un adulte.',
    category: 'learning',
    ageRange: '4-12',
    active: false,
  },
];

function catalogChallenge(code: string): Challenge {
  const found = seedChallengeCatalog.find((challenge) => challenge.code === code);
  if (!found) {
    throw new Error(`Unknown seed challenge: ${code}`);
  }
  const { active: _active, ...challenge } = found;
  return challenge;
}

const thisWeek = mondayOf(localDayOf(new Date()));
const lastWeek = mondayOf(previousDay(thisWeek));

function leaChallenge(
  id: string,
  weekStart: string,
  code: string,
  dates: Pick<ChildChallenge, 'status' | 'chosenAt' | 'completedAt'>,
): StoredChildChallenge {
  return {
    childId: LEA_ID,
    childChallenge: { id, weekStart, challenge: catalogChallenge(code), ...dates },
  };
}

const PROPOSED = { status: 'proposed', chosenAt: null, completedAt: null } as const;

/**
 * Léa chose this week's challenge and completed one last week, whose two
 * other proposals expire on the first read; Tom gets his three on his first
 * read.
 */
export const seedChildChallenges: readonly StoredChildChallenge[] = [
  leaChallenge('child-challenge-lea-1', lastWeek, 'set_the_table', {
    status: 'completed',
    chosenAt: new Date(`${lastWeek}T18:00:00`),
    completedAt: new Date(`${lastWeek}T20:30:00`),
  }),
  leaChallenge('child-challenge-lea-2', lastWeek, 'funny_story', PROPOSED),
  leaChallenge('child-challenge-lea-3', lastWeek, 'help_cook', PROPOSED),
  leaChallenge('child-challenge-lea-4', thisWeek, 'thank_you_note', {
    status: 'chosen',
    chosenAt: new Date(`${thisWeek}T18:00:00`),
    completedAt: null,
  }),
  leaChallenge('child-challenge-lea-5', thisWeek, 'learn_a_word', PROPOSED),
  leaChallenge('child-challenge-lea-6', thisWeek, 'say_thank_you', PROPOSED),
];

export const seedTrophies: readonly Trophy[] = [
  { id: 'teamwork', childId: LEA_ID, name: 'Entraide', status: 'earned' },
  { id: 'creative', childId: LEA_ID, name: 'Créatif', status: 'earned' },
  { id: 'kindness', childId: LEA_ID, name: 'Gentillesse', status: 'earned' },
  { id: 'courage', childId: LEA_ID, name: 'Courage', status: 'earned' },
];
