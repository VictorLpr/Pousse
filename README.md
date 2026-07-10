# Pousse 🌱

Le rituel du soir, ensemble — application mobile (React Native + Expo) issue de la maquette « Cocon ».

## Lancer le projet

```bash
npm install
npm start          # puis choisir Android / iOS / web
```

## Architecture hexagonale

Le code applique une séparation stricte ports / adaptateurs. Les dépendances pointent
toujours vers le domaine, jamais l'inverse :

```
src/
├── domain/           # Cœur métier, sans dépendance externe
│   ├── entities/     # Child, JournalEntry, Emotion, WeeklyChallenge, Trophy
│   └── ports/        # Interfaces : repositories, IdGenerator, Clock
├── application/
│   └── use-cases/    # CreateChildProfile, CompleteEveningRitual, GetJournalEntries…
├── infrastructure/   # Adaptateurs concrets
│   ├── persistence/in-memory/   # Repositories en mémoire + données de démo
│   ├── ids/          # SequentialIdGenerator
│   └── time/         # SystemClock
├── di/               # Racine de composition (container) + provider React
├── ui/               # Présentation : thème, composants, écrans, état
└── app/              # Routes expo-router (fichiers minces qui pointent vers ui/screens)
```

**Brancher l'API plus tard** : implémenter les ports de `src/domain/ports/` avec des
adaptateurs HTTP dans `src/infrastructure/`, puis les substituer dans
`src/di/container.ts`. Rien d'autre ne change.

## Écrans

- Onboarding : bienvenue, création du profil enfant
- Accueil : enfant actif, série de soirs, lancement du rituel
- Rituel du soir (4 étapes) : émotion → fierté → photo → récap, puis écran « Bravo »
- Journal des souvenirs, Défis & trophées, Galerie
- Préférences et changement d'enfant

## Accessibilité

Tous les éléments interactifs portent `accessibilityRole`, `accessibilityLabel` et,
quand utile, `accessibilityState` / `accessibilityHint` (sélections, désactivations).
Les groupes de choix utilisent `radiogroup` / `radio`, les titres `header`, la
progression du rituel `progressbar`.
