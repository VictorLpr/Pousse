/**
 * The privacy policy the parent accepts when creating a child profile, in
 * plain French. Changing what it says means raising `PRIVACY_POLICY_VERSION`:
 * a consent proves the parent agreed to one version of this text.
 */
export interface PrivacyPolicyItem {
  readonly label: string;
  readonly detail: string;
}

export interface PrivacyPolicySection {
  readonly title: string;
  readonly paragraphs: readonly string[];
  readonly items?: readonly PrivacyPolicyItem[];
}

export const PRIVACY_POLICY_INTRO =
  'Pousse garde le strict nécessaire pour vos soirées en famille. Voici, simplement, ce que nous gardons et pourquoi.';

export const PRIVACY_POLICY_SECTIONS: readonly PrivacyPolicySection[] = [
  {
    title: 'Ce que Pousse garde',
    paragraphs: [],
    items: [
      {
        label: 'Vous',
        detail:
          'votre e-mail, votre prénom, votre nom et votre mot de passe, enregistré sous une forme que personne ne peut relire.',
      },
      {
        label: 'Votre enfant',
        detail: "son prénom, sa date de naissance et l'heure de votre rendez-vous du soir.",
      },
      {
        label: 'Vos soirées',
        detail:
          "l'émotion choisie, le petit mot écrit ensemble, les défis réussis et les trophées gagnés.",
      },
      {
        label: 'Votre accord',
        detail: 'le jour où vous avez coché la case, et la version de ce texte.',
      },
      {
        label: 'Votre connexion',
        detail: "l'adresse IP et le type d'appareil, pour protéger votre compte.",
      },
    ],
  },
  {
    title: 'Les photos restent chez vous',
    paragraphs: [
      "Les photos ne quittent pas votre téléphone. Pousse retient seulement le nom du fichier, pour savoir qu'une photo accompagne la soirée.",
      'Si vous changez de téléphone, les photos ne suivent pas : pensez à les garder de votre côté.',
    ],
  },
  {
    title: 'Pourquoi',
    paragraphs: [
      'Pour faire vivre votre rituel du soir, retrouver vos souvenirs et protéger votre compte.',
      "C'est tout : pas de publicité, et rien n'est vendu ni prêté à qui que ce soit.",
    ],
  },
  {
    title: 'Où vont vos données',
    paragraphs: [
      'Elles sont gardées en France, sur les serveurs de Scaleway, à Paris.',
      "La version web de Pousse passe par Cloudflare, qui l'affiche dans votre navigateur et transmet vos échanges à ces serveurs.",
    ],
  },
  {
    title: 'Combien de temps',
    paragraphs: [
      'Tant que votre compte existe.',
      "Quand le profil d'un enfant est supprimé, tout ce qui le concerne part avec lui : ses soirées, ses défis, ses trophées et votre accord.",
    ],
  },
  {
    title: 'Vos droits',
    paragraphs: [
      'Vous pouvez à tout moment consulter, récupérer ou effacer les données de votre enfant.',
      'Ces actions arrivent bientôt, directement dans les Préférences.',
    ],
  },
];

/** Footer of the policy, e.g. "Version 1.0". */
export function privacyPolicyVersionLabel(policyVersion: string): string {
  return `Version ${policyVersion}`;
}
