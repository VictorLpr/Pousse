# ADR-0006 — Découpage modulaire par domaine métier

- **Statut** : Accepté
- **Date** : 2026-09-14

## Contexte

Le référentiel CDA attend une conception en couches démontrable (BC02). Le découpage
classique par nature technique — un dossier `controllers`, un dossier `services`, un
dossier `repositories` — satisfait cette attente mais disperse chaque fonctionnalité
sur trois emplacements et mélange, dans un même dossier, des fichiers sans rapport
entre eux.

## Décision

Découpage **par domaine métier**, chaque module portant ses propres couches :

```
src/
  modules/
    auth/
    journal/
    defis/
    souvenirs/
    lettres/
  shared/
    db/
    errors/
    config/
```

Chaque module contient ses routes, son service, son dépôt de données et ses schémas
Zod. Un module est exposé comme un plugin Fastify.

### Justification

**La séparation des couches est conservée**, à l'identique du découpage technique :
route, service, dépôt de données, dans cet ordre et sans saut.

**L'arborescence reflète le cahier des charges.** Les modules correspondent aux
fonctionnalités décrites au périmètre du MVP. La structure du dépôt explique le produit
sans commentaire, ce qui facilite la lecture en revue comme en soutenance.

**Le découpage s'aligne sur le système de plugins de Fastify** (ADR-0001). Un module est
un plugin encapsulé, ce qui fait porter la frontière par le framework plutôt que par une
convention de dossiers.

## Règles associées

- Une route n'accède jamais directement à un dépôt de données.
- Un service peut appeler le service d'un autre module. Il n'accède jamais au dépôt de
  données d'un autre module.
- Le code partagé se limite à l'infrastructure : connexion à la base, types d'erreurs,
  configuration. Aucune logique métier dans `shared/`.

## Conséquences

- Ces règles ne sont pas appliquées par un outil. Leur respect repose sur la revue et
  sur la discipline. Une vérification par règle de lint sur les imports pourra être
  ajoutée si des franchissements apparaissent.
- Certains éléments transverses — les émotions, les badges — n'appartiennent
  naturellement à aucun module. Ils sont rattachés au module qui les consomme
  principalement plutôt que de créer un module technique fourre-tout.
