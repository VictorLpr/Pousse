# ADR-0009 — Organisation en monorepo (apps/mobile, apps/api)

- **Statut** : Accepté
- **Date** : 2026-09-14

## Contexte

Le projet compte deux applications appelées à évoluer ensemble : le client
Expo (`apps/mobile`, voir ADR-0008) et l'API Fastify décrite par les ADR 0001
à 0007, développée par la même personne. Le contrat entre les deux (routes,
schémas de requête/réponse) change au même rythme que l'écran qui le
consomme : une fonctionnalité type touche généralement une route côté
serveur et l'écran qui l'appelle côté mobile.

Deux organisations de dépôt ont été considérées : un dépôt par application
(polyrepo), ou un dépôt unique contenant les deux (monorepo).

## Décision

**Monorepo avec npm workspaces**, deux applications sous `apps/` :
`apps/mobile` et `apps/api`. Pas d'outil de build inter-packages
(Turborepo, Nx) : aucun package partagé coûteux à construire ne le justifie
pour l'instant.

## Justification

**Une fonctionnalité qui touche les deux couches tient dans une seule
pull request.** Avec deux dépôts séparés, un changement de contrat (nouvelle
route, champ ajouté à une réponse) demanderait deux PR coordonnées à la main,
avec une fenêtre où l'une des deux applications est en avance sur l'autre.
Dans un monorepo, le changement est un seul commit, revu et testé ensemble.

**L'outillage de lint, format et configuration TypeScript se partage sans
duplication.** `.oxlintrc.json`, `.oxfmtrc.json` et les options strictes
communes (`tsconfig.base.json`) vivent une seule fois à la racine ; chaque
application les étend plutôt que de les dupliquer et risquer une dérive entre
les deux.

**Un historique git unique est plus simple à présenter en soutenance.** Le
référentiel CDA évalue les deux couches ensemble ; un seul dépôt donne une
vue chronologique complète du projet plutôt que deux historiques à
recorréler manuellement par date de commit.

**npm workspaces suffit au périmètre actuel.** Aucun package partagé
n'existe encore entre les deux applications — le contrat passe par une
spécification OpenAPI générée côté serveur et consommée côté mobile via un
client typé (ADR-0001), pas par du code TypeScript partagé. Turborepo/Nx
apportent un cache de build et une exécution de tâches inter-packages :
aucun bénéfice tant qu'il n'y a rien de coûteux à mettre en cache.

### Alternatives écartées

**Deux dépôts séparés** — isolation la plus stricte et historique le plus
simple par application, mais coordination manuelle de version pour chaque
changement de contrat et impossibilité de faire une PR atomique
front + back. Écarté : le coût de coordination dépasse le bénéfice d'isolation
pour un développeur seul.

**pnpm + Turborepo** — meilleure mise à l'échelle si le nombre de packages
partagés croît, mais ajoute un gestionnaire de paquets et un outil de build
supplémentaires à apprendre et maintenir sans bénéfice mesurable aujourd'hui.
Peut être reconsidéré si un package partagé (client OpenAPI généré, design
tokens) devient coûteux à builder.

## Conséquences

- **Un seul pipeline CI doit gérer deux runtimes différents** (React
  Native/Expo côté mobile, Node/Fastify côté API). Les étapes de build/test
  doivent être conditionnées par workspace plutôt que lancées globalement.
- **Impossible de scinder l'accès au dépôt plus tard sans réécrire
  l'historique.** Si les deux applications devaient un jour être maintenues
  par des équipes séparées avec des permissions différentes, la séparation
  coûterait une extraction d'historique (`git filter-repo` ou équivalent).
- **La taille du dépôt cumule les deux applications**, y compris leurs
  dépendances respectives (React Native d'un côté, Fastify/Drizzle de
  l'autre) — sans impact pratique au volume actuel.
- Les ADR restent uniques et partagés dans `docs/adr/` à la racine : ils
  documentent des décisions produit, pas des décisions propres à une seule
  application.
