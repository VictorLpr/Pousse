# Pousse — client mobile

Application mobile (React Native + Expo) issue de la maquette « Cocon ».

## Lancer le projet

Depuis la racine du monorepo :

```bash
npm install
npm run mobile:web   # puis choisir Android / iOS / web, ou npm run mobile
```

## Architecture : modules métier, hexagonale à l'intérieur de chacun

Le code applique une séparation stricte ports / adaptateurs, à l'intérieur de
modules organisés par domaine métier — miroir du découpage de l'API
(`apps/api`, ADR-0006). Détail complet dans [AGENTS.md](AGENTS.md).

```
src/
├── modules/
│   ├── auth/        # comptes parents, foyers, enfants, session
│   ├── journal/      # rituel du soir, entrées de journal
│   ├── defis/         # défis hebdomadaires, trophées
│   ├── souvenirs/      # galerie photo (ui/ seulement, consomme journal)
│   └── settings/        # préférences (ui/ seulement, consomme auth)
│       chaque module métier porte domain/ application/ infrastructure/ ui/
├── shared/            # thème, composants génériques, Clock/IdGenerator
├── di/                # racine de composition (container) + provider React
└── app/               # routes expo-router (fichiers minces vers ui/screens)
```

**Brancher l'API plus tard** : implémenter les ports de chaque
`modules/<nom>/domain/ports/` avec des adaptateurs HTTP dans
`modules/<nom>/infrastructure/`, puis les substituer dans `src/di/container.ts`.
Rien d'autre ne change.

## Écrans

- Onboarding : bienvenue, inscription (email + mot de passe), création du foyer, profil enfant
- Connexion : email + mot de passe (compte démo : `parent@demo.fr` / `pousse123`)
- Foyer : page d'accueil listant les enfants du foyer, sélection de l'enfant du soir
- Accueil enfant : série de soirs, lancement du rituel
- Rituel du soir (4 étapes) : émotion → fierté → photo → récap, puis écran « Bravo »
- Journal des souvenirs, Défis & trophées, Galerie
- Préférences (rappel, déconnexion) et changement d'enfant via la page foyer

## Accessibilité

Tous les éléments interactifs portent `accessibilityRole`, `accessibilityLabel` et,
quand utile, `accessibilityState` / `accessibilityHint` (sélections, désactivations).
Les groupes de choix utilisent `radiogroup` / `radio`, les titres `header`, la
progression du rituel `progressbar`.
