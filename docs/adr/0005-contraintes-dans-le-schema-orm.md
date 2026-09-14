# ADR-0005 — Les contraintes vivent dans le schéma de l'ORM

- **Statut** : Accepté
- **Date** : 2026-09-14

## Contexte

La modélisation Merise a produit un ensemble de règles de gestion dont plusieurs
pourraient être appliquées par la base : déclencheurs, contraintes de vérification,
index partiels, révocation de droits.

Le modèle conceptuel et le modèle logique ont une vocation documentaire : ils
expliquent les entités, les cardinalités et les dépendances fonctionnelles. Ils ne sont
pas destinés à être appliqués directement en SQL.

## Décision

**Le schéma déclaré dans l'ORM est la seule source de vérité du modèle physique.** La
base n'est jamais créée ni modifiée en dehors des migrations générées depuis ce schéma.

**Aucun déclencheur n'est utilisé.** Les règles qu'un déclencheur aurait portées sont
soit exprimées en contraintes déclaratives dans le schéma, soit appliquées dans la
couche service.

### Justification

**Un déclencheur est invisible depuis le code appelant.** Il ne se teste pas
unitairement, n'apparaît dans aucune pile d'appel, et divise la source de vérité entre
le schéma et un ensemble de fonctions SQL maintenues à part. Le coût de maintenance et
d'explicabilité dépasse le bénéfice sur un projet de cette taille.

**Pour la majorité des règles concernées, le déclencheur était de toute façon le
mauvais outil.** Trois d'entre elles dépendent de l'heure courante ou d'un décompte de
lignes, que rien de déclaratif ne sait exprimer. Leur place naturelle est la couche
service.

### Répartition retenue

Restent déclaratives dans le schéma :

| Règle | Expression |
|---|---|
| Un seul souvenir par jour et par enfant | `unique(enfant_id, date)` |
| Une seule lettre par mois et par enfant | `unique(enfant_id, mois)` |
| Un badge attribué une seule fois par enfant | clé primaire composite |
| Un consentement et un seul par enfant | `unique(enfant_id)` |
| Un même défi non proposé deux fois dans la semaine | `unique(enfant_id, defi_id, semaine)` |
| Un seul défi engagé par enfant et par semaine | index unique partiel |
| Attestation de représentant légal obligatoirement vraie | contrainte de vérification |
| Cohérence entre statut et dates associées | contrainte de vérification conditionnelle |
| Suppression complète des données | suppression en cascade depuis le parent |

Appliquées dans la couche service :

| Règle | Emplacement |
|---|---|
| Trois défis proposés par enfant et par semaine | service de tirage hebdomadaire |
| Entrée modifiable pendant vingt-quatre heures | service journal, comparaison à `cree_le` |
| Âge compris entre quatre et douze ans à la création | validation Zod puis service |
| Défi conforme à la tranche d'âge | service de tirage hebdomadaire |

## Conséquences

- **L'immuabilité du consentement est affaiblie.** La garantie passe de « la base
  refuse la mise à jour » à « aucun chemin de code ne l'expose ». Compensations
  retenues : aucune méthode de mise à jour n'est déclarée dans le dépôt de données du
  consentement, et la contrainte de vérification sur l'attestation empêche qu'une
  écriture accidentelle l'invalide. La régression est réelle et assumée.
- Les règles applicatives doivent être couvertes par des tests. Leur application ne
  repose plus sur le SGBD.
- Le retrait d'un défi du catalogue est traité par un attribut `actif` sur `DEFI` plutôt
  que par une suppression. L'historique des défis réussis reste référencé, aucune clé
  étrangère ne bloque, et la règle reste déclarative.
- Le modèle logique documentaire et le schéma de l'ORM peuvent diverger sur des détails
  de nommage et de découpage. C'est admis : leurs fonctions sont distinctes.
