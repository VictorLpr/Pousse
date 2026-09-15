# Pousse API — Rules for agents

`apps/api` est l'API REST du monorepo Pousse : Fastify 5 + TypeScript, consommée
exclusivement par `apps/mobile`. Elle est aujourd'hui un **scaffold** — aucune
route métier n'existe encore. Ce document opérationnalise les décisions déjà
actées dans `../../docs/adr/` (0001 à 0007) ; en cas de doute, l'ADR fait foi
et ce fichier se corrige pour rester cohérent avec elle, jamais l'inverse.

## 1. Framework et validation (ADR-0001)

- Fastify 5, `fastify-type-provider-zod` pour valider les entrées et
  **sérialiser les sorties**. Toute route déclare un schéma de réponse Zod :
  un champ absent du schéma ne doit jamais atteindre le client, y compris par
  erreur de développeur — c'est la garantie que la sérialisation par schéma
  offre et qu'aucun test manuel ne peut remplacer.
- `@fastify/swagger` génère la spécification OpenAPI à partir des mêmes
  schémas. Ne jamais maintenir une documentation d'API séparée du code.
- Pino est déjà embarqué (`Fastify({ logger: true })`) : ne pas ajouter un
  second logger.

## 2. Données (ADR-0002, ADR-0005)

- **Drizzle est l'unique source de vérité du schéma physique.** La base n'est
  jamais modifiée hors des migrations générées par `drizzle-kit` depuis
  `src/shared/db/schema.ts` (à créer). Aucun SQL écrit à la main en dehors des
  migrations générées.
- Toute contrainte exprimable en base (unicité composite, `check()`, index
  partiel, clé composite, cascade) est déclarée dans le schéma Drizzle, jamais
  dans un déclencheur. Voir le tableau de répartition de l'ADR-0005 pour la
  liste exacte des règles déclaratives vs. celles qui restent en couche
  service (âge de l'enfant, fenêtre de vingt-quatre heures, tirage
  hebdomadaire…).
- L'API relationnelle est `defineRelations` (RQB v2) ; ne pas utiliser l'ancien
  style à fonctions de rappel de `drizzle-orm/_relations`.
- Dans un index partiel, le prédicat `.where()` s'écrit avec le gabarit `sql`,
  jamais avec `eq()`.

## 3. Authentification (ADR-0003)

- BetterAuth en configuration par défaut : pas de plugin JWT, pas de jeton de
  renouvellement. Une session se révoque immédiatement ; ne réintroduis jamais
  un jeton sans état pour « simplifier » un appel.
- La table `user` de BetterAuth tient lieu de `PARENT` du modèle logique.
  `enfant.parent_id` référence `user.id`, pas une table `PARENT` séparée.
- Montage sur Fastify : désactiver l'analyse du corps sur la route
  d'authentification, recopier **tous** les en-têtes `Set-Cookie` (pas
  seulement le premier), monter la route en joker.
- Le mobile doit lire le cookie de session depuis `expo-secure-store` et
  l'ajouter explicitement aux requêtes métier — le plugin Expo ne l'attache
  automatiquement qu'aux appels du client d'authentification.

## 4. Découpage modulaire (ADR-0006)

Structure imposée, chaque module portant ses propres couches :

```
src/
  modules/
    auth/       journal/       defis/       souvenirs/       lettres/
  shared/
    db/         errors/        config/
```

- **Une route n'accède jamais directement à un dépôt de données** — toujours
  via un service.
- **Un service peut appeler le service d'un autre module. Il n'accède jamais
  au dépôt de données d'un autre module.** C'est la règle qui a motivé le
  correctif appliqué côté mobile (`InitializeChildProgress`, voir
  `apps/mobile/AGENTS.md`) : applique le même réflexe ici avant d'écrire un
  service qui importe le repository d'un autre module.
- `shared/` ne contient que de l'infrastructure (connexion base, types
  d'erreur, configuration) — aucune logique métier.
- Un module est exposé comme un plugin Fastify (`app.register(xModule, {
prefix: '/x' })`, voir `src/app.ts`). Le franchissement d'une frontière de
  module doit échouer au démarrage, pas seulement en revue.
- Émotions et badges n'appartiennent naturellement à aucun module : ils sont
  rattachés au module qui les consomme principalement (badges → `defis`)
  plutôt que de créer un module technique fourre-tout.

## 5. Tests (ADR-0007)

- Jest comme lanceur de tests. `fastify.inject()` pour les tests de routes —
  jamais Supertest, jamais de serveur HTTP réellement démarré dans les tests.
- Testcontainers fournit une instance PostgreSQL réelle aux tests
  d'intégration. **Aucune simulation de la couche d'accès aux données** : une
  contrainte de base (unicité, `check()`, cascade) ne se vérifie que contre un
  vrai PostgreSQL.
- Isolement entre tests par transaction annulée, pas par recréation du
  schéma ; le conteneur démarre une fois pour toute la suite.
- Niveaux : unitaire (logique de service pure, aucune base), intégration
  (routes + dépôts + contraintes, conteneur PostgreSQL), bout en bout
  (parcours principaux depuis l'app mobile, environnement dédié).

## 6. Conventions

- Kebab-case pour les fichiers, un service/dépôt/route par fichier.
- Imports internes via le mapping natif Node `#/*` (`package.json` →
  `imports`), **avec l'extension `.js`** et `/index.js` pour un module :
  `import { buildApp } from '#/app.js'`. En développement, la condition
  `development` résout vers `src/` (tsx) ; en production, vers `dist/`
  (`node dist/server.js`). Ne pas réintroduire d'alias `paths` de tsconfig :
  `tsc` ne les réécrit pas et le code compilé ne démarrerait plus.
- `import type` pour les imports de type uniquement.
- `npx tsc --noEmit` doit passer avant de considérer un changement terminé.
- Le code et les messages d'erreur renvoyés au client sont en français, comme
  côté mobile.
- Pas de nouvelle dépendance sans raison forte — en particulier, ne pas
  ajouter de couche d'abstraction au-dessus de Drizzle ou de Fastify que les
  ADR n'ont pas retenue (Prisma, Kysely, NestJS, Express : voir les
  alternatives déjà écartées dans les ADR correspondants avant de les
  reproposer).
