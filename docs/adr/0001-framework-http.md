# ADR-0001 — Framework HTTP : Fastify

- **Statut** : Accepté
- **Date** : 2026-09-14

## Contexte

Le backend est une API REST en Node.js / TypeScript, consommée exclusivement par une
application mobile React Native (Expo). Elle manipule des données de mineurs : prénom,
date de naissance, et des textes rédigés par des enfants.

Le développement est mené en solo sur environ seize semaines. Le référentiel CDA
(RNCP37873) attend une démonstration de développement sécurisé (BC01), de conception
en couches (BC02) et d'une chaîne de tests et de déploiement (BC03).

Candidats évalués : Express 5, Fastify 5, NestJS 11, Hono.

## Décision

**Fastify 5**, avec `fastify-type-provider-zod` pour la validation et
`@fastify/swagger` pour la génération de la spécification OpenAPI.

### Justification

**La sérialisation par schéma est la garantie la plus forte disponible sur la
confidentialité des réponses.** Fastify valide les entrées _et_ sérialise les sorties
à partir d'un schéma déclaré : un champ non déclaré dans le schéma de réponse est
retiré de la charge utile. La protection passe de « le développeur a pensé à ne pas
exposer `date_naissance` » à « la couche de transport ne peut pas l'exposer ». Sur une
application traitant des données d'enfants, c'est une propriété vérifiable, pas une
intention.

**L'encapsulation des plugins fait porter une partie de la séparation des couches par
le framework.** Un plugin Fastify ne voit pas les décorateurs déclarés par ses frères
sauf usage explicite de `fastify-plugin`. Le franchissement d'une frontière de module
échoue au démarrage. La discipline n'est pas seulement une convention de dossiers.

**La spécification OpenAPI dérive des mêmes schémas que la validation.** Elle devient
un sous-produit du code plutôt qu'un document maintenu en parallèle, ce qui élimine
la dérive entre documentation et comportement réel. Elle sert également de source pour
la génération d'un client typé côté Expo (`openapi-typescript` + `openapi-fetch`) :
un livrable dont dépend le code ne peut pas devenir obsolète sans que la compilation
le signale.

**La journalisation structurée est intégrée.** Pino est embarqué, avec corrélation par
requête, sans dépendance ni configuration supplémentaire.

### Alternatives écartées

**Express 5** — écosystème le plus large et le mieux documenté en français, mais
n'apporte ni validation, ni sérialisation, ni structure, ni spécification d'API. Tout
ce qui précède devrait être construit et maintenu à la main.

**NestJS 11** — impose une architecture en couches et fournit l'injection de
dépendances, ce qui répondrait directement à l'attente du BC02. Écarté pour sa
verbosité au regard d'un modèle de onze relations, et pour le risque que la complexité
du framework consomme un temps de développement destiné au métier.

**Hono** — handler au standard Web Fetch et client RPC typé de bout en bout. Écarté
parce que ses arguments principaux (empreinte réduite, démarrage à froid, portabilité
vers les runtimes edge) ne correspondent à aucune contrainte d'un déploiement
conteneurisé sur serveur, et parce qu'il ne valide pas les réponses : les schémas de
sortie y sont documentaires, ce qui supprime la garantie retenue ci-dessus.

## Conséquences

- Les ressources en français sont nettement moins nombreuses que pour Express. La
  documentation officielle anglophone sera la référence quotidienne.
- Le système d'encapsulation des plugins demande un temps d'appropriation estimé à une
  journée. Le comportement de `fastify-plugin` doit être compris avant le premier
  découpage en modules.
- Le montage de la bibliothèque d'authentification nécessite un adaptateur entre les
  objets Node de Fastify et le standard Web Fetch (voir ADR-0003). Coût estimé à une
  journée, à traiter en premier sprint, avant tout code métier.
- La génération du client mobile typé passe par un intermédiaire OpenAPI, là où un
  framework à RPC intégré l'offrirait directement.
