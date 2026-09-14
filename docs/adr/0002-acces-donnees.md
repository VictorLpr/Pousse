# ADR-0002 — Accès aux données : Drizzle ORM

- **Statut** : Accepté
- **Date** : 2026-09-14

## Contexte

La base est un PostgreSQL 16. Le modèle logique compte onze relations et porte une part
importante des règles de gestion sous forme de contraintes : unicités composites,
contrainte de vérification conditionnelle, index unique partiel, clé primaire composite,
suppression en cascade depuis `PARENT`.

Le schéma déclaré dans l'ORM est la source de vérité du modèle physique (voir ADR-0005).
Il ne doit donc pas exister de contrainte applicable à la base qui ne soit pas
exprimable dans ce schéma.

Candidats évalués : Prisma, Drizzle, Kysely, `pg` avec SQL écrit à la main.

## Décision

**Drizzle ORM**, avec `drizzle-kit` pour la génération des migrations, épinglé à une
version exacte pour la durée du projet.

### Justification

**Drizzle exprime nativement l'intégralité des contraintes du modèle** dans le schéma
TypeScript :

| Besoin | Expression |
|---|---|
| Unicités composites | `unique()` / `uniqueIndex()` |
| Un seul défi engagé par enfant et par semaine | ``uniqueIndex().on(...).where(sql`...`)`` |
| Attestation de représentant légal obligatoirement vraie | `check()` |
| Cohérence entre statut et dates associées | `check()` conditionnel |
| Clé primaire composite de `OBTENTION` | `primaryKey({ columns: [...] })` |
| Suppression complète des données | `references(..., { onDelete: 'cascade' })` |

**Les migrations générées sont du SQL lisible et versionné**, dérivé du schéma. Le
schéma reste la source unique, et le SQL appliqué à la base est inspectable en revue.

**Le SQL produit à l'exécution reste proche de la requête écrite**, ce qui facilite la
lecture des plans d'exécution et la justification des choix d'indexation.

### Alternatives écartées

**Prisma** — meilleure expérience de développement du panel et outillage plus mature.
Écarté sur un point rédhibitoire au regard de l'ADR-0005 : les contraintes de
vérification ne sont pas exprimables dans `schema.prisma`, et les index partiels n'y
sont disponibles que derrière un indicateur de fonctionnalité en aperçu, avec des
anomalies de migration documentées (index supprimé et recréé à chaque migration
suivante, boucles de génération sur certaines colonnes). Retenir Prisma imposerait
d'écrire du SQL à la main en marge du schéma, ce qui briserait la source de vérité
unique.

**Kysely** — constructeur de requêtes typé, sans couche ORM. Solution techniquement
saine et très lisible, mais ne porte pas la définition du schéma : les contraintes
vivraient dans des migrations SQL écrites à la main, ce que l'ADR-0005 exclut.

**`pg` et SQL à la main** — contrôle total, aucun typage des résultats sans effort
manuel important, et volume de code incompatible avec le calendrier.

## Conséquences

- Drizzle est publié en version candidate. La version est épinglée dans `package.json`
  et n'est pas mise à jour avant la soutenance. Une montée de version en cours de
  projet est un risque non nécessaire.
- L'API relationnelle utilisée est `defineRelations` (RQB v2). L'ancienne API à
  fonctions de rappel, désormais sous `drizzle-orm/_relations`, n'est pas employée. La
  coexistence des deux syntaxes dans la documentation et dans les ressources en ligne
  est une source d'erreur connue.
- Dans la clause `.where()` d'un index partiel, le prédicat doit être écrit avec le
  gabarit `sql` et non avec `eq()`. Ce dernier produit un paramètre non substitué
  (`$1`) et donc du SQL invalide, avec échec de `drizzle-kit`.
- Les ressources en français sont rares. L'essentiel de la référence est la
  documentation officielle et le suivi des tickets du dépôt.
