import type { challenge } from '#/shared/db/schema.js';

/**
 * Challenge catalog: rows are inserted in this order, and a new challenge
 * goes at the end. Codes are stable English keys; titles and descriptions
 * are French display content. Every challenge is something to do at home,
 * ideally as a family, with no purchase and no screen.
 *
 * A child draws from its own age range plus '4-12', so each range keeps at
 * least six active challenges and the four categories. A challenge is never
 * removed from this list: retire it with `active: false`.
 */
export const CHALLENGES: readonly (typeof challenge.$inferInsert)[] = [
  // 4-7
  {
    code: 'tidy_toys',
    title: 'Range tes jouets avant le dodo',
    description:
      "Avant d'aller au lit, remets tes jouets à leur place. Un adulte peut t'aider à trouver où va chaque chose.",
    ageRange: '4-7',
    category: 'helping',
  },
  {
    code: 'set_the_table',
    title: 'Aide à mettre la table',
    description:
      'Pose les assiettes, les verres et les couverts pour toute la famille avant le repas.',
    ageRange: '4-7',
    category: 'helping',
  },
  {
    code: 'draw_your_family',
    title: 'Dessine ta famille',
    description:
      'Dessine toutes les personnes de ta maison, puis montre ton dessin et raconte qui est qui.',
    ageRange: '4-7',
    category: 'creativity',
  },
  {
    code: 'find_red_things',
    title: 'Trouve 5 objets rouges dans la maison',
    description:
      'Cherche cinq objets rouges dans la maison et montre-les à un adulte. Et si vous essayiez ensuite avec le bleu ?',
    ageRange: '4-7',
    category: 'learning',
  },
  {
    code: 'magic_words',
    title: "Dis merci et s'il te plaît toute la journée",
    description:
      "Pendant une journée, pense à dire « s'il te plaît » quand tu demandes et « merci » quand on t'aide.",
    ageRange: '4-7',
    category: 'politeness',
  },
  {
    code: 'morning_hello',
    title: 'Dis bonjour à chaque personne de la maison',
    description:
      'Le matin, va dire bonjour à chaque personne de la maison, avec un sourire ou un câlin.',
    ageRange: '4-7',
    category: 'politeness',
  },
  // 8-12
  {
    code: 'cook_together',
    title: 'Prépare un repas avec un adulte',
    description:
      "Choisis une recette simple avec ce qu'il y a à la maison et cuisine-la avec un adulte, de la préparation au rangement.",
    ageRange: '8-12',
    category: 'helping',
  },
  {
    code: 'help_unasked',
    title: "Rends un service sans qu'on te le demande",
    description:
      "Repère une tâche utile à la maison (vider le lave-vaisselle, plier le linge…) et fais-la sans qu'on te le demande.",
    ageRange: '8-12',
    category: 'helping',
  },
  {
    code: 'write_a_story',
    title: 'Invente une histoire et lis-la à ta famille',
    description:
      'Écris une courte histoire avec le héros de ton choix, puis lis-la à voix haute à ta famille.',
    ageRange: '8-12',
    category: 'creativity',
  },
  {
    code: 'new_word',
    title: 'Apprends un mot nouveau',
    description:
      'Trouve dans un livre ou un dictionnaire un mot que tu ne connais pas, explique-le à ta famille et place-le dans une phrase.',
    ageRange: '8-12',
    category: 'learning',
  },
  {
    code: 'family_quiz',
    title: 'Prépare un quiz pour ta famille',
    description:
      'Écris cinq questions sur un sujet que tu aimes et pose-les à ta famille pendant le repas.',
    ageRange: '8-12',
    category: 'learning',
  },
  {
    code: 'thank_you_note',
    title: 'Écris un mot de remerciement',
    description:
      "Écris un petit mot pour remercier quelqu'un de la maison de ce qu'il a fait pour toi, et glisse-le là où il le trouvera.",
    ageRange: '8-12',
    category: 'politeness',
  },
  // 4-12
  {
    code: 'fold_laundry',
    title: 'Aide à plier le linge',
    description: 'Aide un adulte à plier le linge propre et à le ranger à la bonne place.',
    ageRange: '4-12',
    category: 'helping',
  },
  {
    code: 'pillow_hut',
    title: 'Construis une cabane en coussins',
    description:
      'Avec des coussins, des couvertures et des chaises, construisez une cabane en famille et passez un moment dedans.',
    ageRange: '4-12',
    category: 'creativity',
  },
  {
    code: 'funny_story',
    title: 'Raconte une histoire drôle à ta famille',
    description:
      'Pendant le repas ou avant le coucher, raconte une histoire ou une blague qui fait rire tout le monde.',
    ageRange: '4-12',
    category: 'creativity',
  },
  {
    code: 'learn_a_song',
    title: 'Apprends une chanson avec un adulte',
    description:
      "Demande à un adulte de t'apprendre une chanson ou une comptine qu'il connaît, puis chantez-la ensemble.",
    ageRange: '4-12',
    category: 'learning',
  },
  {
    code: 'guess_the_object',
    title: "Devine l'objet les yeux fermés",
    description:
      "Les yeux fermés, touche les objets que ta famille te donne et devine ce que c'est. Puis échangez les rôles.",
    ageRange: '4-12',
    category: 'learning',
  },
  {
    code: 'kind_compliment',
    title: "Fais un compliment à quelqu'un que tu aimes",
    description: 'Dis à une personne de ta famille ce que tu aimes chez elle.',
    ageRange: '4-12',
    category: 'politeness',
  },
];
