# ADR-0007 — Stratégie de tests

- **Statut** : Accepté
- **Date** : 2026-09-14

## Contexte

Une part significative des règles de gestion est appliquée par des contraintes de la
base (ADR-0005) : unicités composites, contraintes de vérification, index partiel,
suppression en cascade. Un dépôt de données simulé ne vérifie aucune de ces règles.

Le BC03 attend une chaîne de tests exécutée en intégration continue.

## Décision

- **Jest** comme lanceur de tests.
- **`fastify.inject()`** pour les tests de routes, sans démarrage de serveur HTTP.
- **Testcontainers** pour fournir une instance PostgreSQL réelle aux tests
  d'intégration.
- Aucune simulation de la couche d'accès aux données.

### Justification

**Les contraintes ne se testent que contre une vraie base.** Vérifier que la deuxième
entrée de journal du même jour pour le même enfant est bien rejetée exige un PostgreSQL
qui applique réellement la contrainte. Un dépôt simulé testerait le test.

**`fastify.inject()` rend Supertest inutile.** Le framework exécute le cycle complet
d'une requête en mémoire, sans port à ouvrir, sans attente de démarrage et sans conflit
de port en exécution parallèle.

**Testcontainers réutilise l'outillage déjà en place.** Docker est requis par le
déploiement ; il ne s'agit pas d'une dépendance supplémentaire pour l'intégration
continue.

## Découpage

| Niveau       | Portée                                                                                                       | Base                 |
| ------------ | ------------------------------------------------------------------------------------------------------------ | -------------------- |
| Unitaire     | logique métier pure des services : calcul de tranche d'âge, fenêtre de vingt-quatre heures, tirage des défis | aucune               |
| Intégration  | routes complètes, dépôts de données, contraintes                                                             | conteneur PostgreSQL |
| Bout en bout | parcours principaux depuis l'application mobile                                                              | environnement dédié  |

## Conséquences

- La suite d'intégration est plus lente qu'une suite simulée : quelques secondes de
  démarrage du conteneur. Le conteneur est démarré une fois pour l'ensemble de la suite,
  et l'isolement entre tests est assuré par transaction annulée plutôt que par
  recréation du schéma.
- Docker devient une dépendance de développement et d'intégration continue.
- Supertest, envisagé initialement, n'est pas retenu.
