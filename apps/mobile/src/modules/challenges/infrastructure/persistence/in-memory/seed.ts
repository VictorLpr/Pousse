import type { Challenge } from '@/modules/challenges/domain/entities/challenge';
import type { ChildChallenge } from '@/modules/challenges/domain/entities/child-challenge';
import type {
  CatalogBadge,
  StoredBadgeAward,
} from '@/modules/challenges/infrastructure/persistence/in-memory/in-memory-badge-repository';
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
/** When Léa completed last week's challenge, her first one. */
const leaFirstChallenge = new Date(`${lastWeek}T20:30:00`);

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
    completedAt: leaFirstChallenge,
  }),
  leaChallenge('child-challenge-lea-2', lastWeek, 'funny_story', PROPOSED),
  leaChallenge('child-challenge-lea-3', lastWeek, 'help_cook', PROPOSED),
  leaChallenge('child-challenge-lea-4', thisWeek, 'thank_you_note', {
    status: 'chosen',
    // Never in the future, or completing it on a Monday morning would end before it began.
    chosenAt: new Date(Math.min(Date.now(), Date.parse(`${thisWeek}T18:00:00`))),
    completedAt: null,
  }),
  leaChallenge('child-challenge-lea-5', thisWeek, 'learn_a_word', PROPOSED),
  leaChallenge('child-challenge-lea-6', thisWeek, 'say_thank_you', PROPOSED),
];

/** The API's badge catalog (`apps/api/src/shared/db/catalogs/badges.ts`), in display order. */
export const seedBadgeCatalog: readonly CatalogBadge[] = [
  {
    code: 'first_evening',
    label: 'Premier soir',
    description: 'Tu as raconté ta première soirée.',
  },
  {
    code: 'three_evenings',
    label: 'Trois soirs de suite',
    description: 'Trois soirées racontées sans en manquer une.',
  },
  {
    code: 'seven_evenings',
    label: 'Une semaine de soirées',
    description: 'Sept soirées de suite, bravo !',
  },
  {
    code: 'thirty_evenings',
    label: 'Un mois de soirées',
    description: 'Trente soirées de suite, quel rituel !',
  },
  {
    code: 'first_challenge',
    label: 'Premier défi',
    description: 'Tu as relevé ton premier défi.',
  },
  {
    code: 'helping_challenge',
    label: 'Entraide',
    description: 'Tu as relevé un défi pour aider.',
  },
  {
    code: 'creativity_challenge',
    label: 'Créatif',
    description: 'Tu as relevé un défi de création.',
  },
  {
    code: 'learning_challenge',
    label: 'Curieux',
    description: 'Tu as relevé un défi pour apprendre.',
  },
  {
    code: 'politeness_challenge',
    label: 'Gentillesse',
    description: 'Tu as relevé un défi de politesse.',
  },
];

/** Six evenings ago at 20:15: Léa's oldest journal entry. */
const leaFirstEvening = new Date();
leaFirstEvening.setDate(leaFirstEvening.getDate() - 6);
leaFirstEvening.setHours(20, 15, 0, 0);

/**
 * Léa's badges. Her streak of three evenings came before badges did, and
 * the API awards nothing for past history: tonight's ritual earns her
 * « Trois soirs de suite », and this week's challenge « Gentillesse ». Tom
 * has none yet.
 */
export const seedBadgeAwards: readonly StoredBadgeAward[] = [
  { childId: LEA_ID, code: 'first_evening', awardedAt: leaFirstEvening },
  { childId: LEA_ID, code: 'first_challenge', awardedAt: leaFirstChallenge },
  { childId: LEA_ID, code: 'helping_challenge', awardedAt: leaFirstChallenge },
];
