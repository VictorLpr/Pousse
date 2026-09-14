# ADR-0008 — Choix d'Expo (React Native) pour le client mobile

- **Statut** : Accepté
- **Date** : 2026-09-14

## Contexte

Le client est une application mobile ciblant iOS et Android, développée par
une seule personne sur seize semaines aux côtés du backend (ADR-0001 à
ADR-0007). Le référentiel CDA attend une démonstration de conception en
couches (BC02) et une chaîne de tests et de déploiement (BC03), sur les deux
couches du projet, pas seulement le serveur.

Candidats évalués : React Native CLI (« bare »), Expo (workflow managé),
Flutter, deux applications natives séparées (Swift + Kotlin), une PWA.

## Décision

**Expo SDK, workflow managé**, avec `expo-router` pour la navigation par
fichiers et EAS pour le build et la distribution.

### Justification

**Un seul code base pour deux plateformes est la seule option compatible avec
le calendrier solo.** Deux applications natives doubleraient le volume de code
à écrire et à tester dans un temps déjà contraint ; Flutter imposerait
d'apprendre un langage (Dart) et un écosystème séparés sans bénéfice
supplémentaire pour ce périmètre.

**Le workflow managé retire la configuration native du chemin critique.**
Aucun fichier Gradle ni projet Xcode à maintenir à la main ; les capacités
utilisées par l'application (stockage sécurisé pour la session — ADR-0003,
système de fichiers pour les photos — ADR-0004, polices, notifications) sont
toutes couvertes par des modules `expo-*` déjà maintenus.

**`expo-router` réduit le code de navigation à écrire et à tester.** Le
routage par fichiers avec routes typées (`typedRoutes`) fait porter une partie
de la correction par le compilateur plutôt que par des tests de navigation
manuels — cohérent avec l'esprit de l'ADR-0001 côté serveur (faire porter des
garanties par l'outillage plutôt que par la discipline).

**EAS Build/Update permet de distribuer sans machine macOS dédiée.** Un
développeur seul sur Windows/Linux peut produire un binaire iOS signé et
pousser une mise à jour OTA sans matériel Apple.

### Alternatives écartées

**React Native CLI (bare)** — même moteur, mais reporte sur le développeur
toute la configuration native (Gradle, CocoaPods, linking manuel des modules)
qu'Expo automatise. Aucun bénéfice pour ce périmètre, qui n'a besoin d'aucun
module natif hors de l'écosystème `expo-*`.

**Flutter** — écosystème mature, mais changement de langage et
d'outillage complet sans justification métier ; le temps d'appropriation
consommerait une part du calendrier destinée au produit.

**Deux applications natives (Swift + Kotlin)** — meilleure intégration
plateforme, mais double le code à écrire, tester et maintenir seul. Écarté
sans hésitation pour un MVP à seize semaines.

**PWA** — aucune installation ni build natif requis, mais accès limité aux
capacités attendues (notifications fiables, stockage sécurisé de session hors
navigateur) et expérience dégradée sur iOS. Écartée : les ADR 0003 et 0004
supposent déjà des API natives (`expo-secure-store`, `expo-file-system`).

## Conséquences

- **Toute release dépend d'EAS Build.** File d'attente et quota du plan
  gratuit à surveiller ; un blocage côté service Expo bloque la distribution,
  pas seulement le développement.
- **Le SDK Expo a structurellement du retard sur la dernière version de React
  Native.** Une fonctionnalité native très récente peut ne pas être
  disponible immédiatement.
- **Sortir du workflow managé (prebuild) a un coût non nul.** Si un module
  natif hors écosystème Expo devient nécessaire, l'application doit être
  éjectée du workflow managé ; ce coût est accepté comme un risque futur, pas
  comme une probabilité du périmètre actuel.
- Le choix technique correspond à celui déjà en place dans le dépôt : cet ADR
  documente rétroactivement une décision prise avant la mise en place du
  processus ADR, au même titre que les ADR 0001 à 0007 pour le backend.
