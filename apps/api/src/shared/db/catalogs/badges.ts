import type { badge } from '#/shared/db/schema.js';

/**
 * Badge catalog, in display order: rows are inserted in this order, and the
 * API lists them by `id`. A new badge goes at the end, with its condition in
 * `modules/challenges/badge-service.ts`. Codes are stable English keys;
 * labels and descriptions are French display content.
 */
export const BADGES: readonly (typeof badge.$inferInsert)[] = [
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
