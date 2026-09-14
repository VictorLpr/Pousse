# ADR-0003 — Authentification par session persistée

- **Statut** : Accepté
- **Date** : 2026-09-14

## Contexte

L'application gère des comptes parents et, par leur intermédiaire, des données
personnelles d'enfants de quatre à douze ans. Le RGPD impose que l'exercice du droit à
l'effacement et la révocation d'un accès prennent effet sans délai.

Le client est une application mobile Expo. Aucun service tiers n'a besoin de vérifier
une identité émise par ce backend.

Deux modèles ont été considérés : jeton d'accès sans état (JWT) accompagné d'un jeton
de renouvellement, ou session persistée côté serveur.

## Décision

**Session persistée en base**, avec identifiant de session stocké côté client dans le
trousseau sécurisé du système (`expo-secure-store`).

L'implémentation retenue est **BetterAuth**, dans sa configuration par défaut : pas de
plugin JWT, pas de jeton de renouvellement, fonction de dérivation de clé par défaut.

### Justification

**Une session se révoque immédiatement, un jeton sans état ne se révoque pas.** Un JWT
reste valide jusqu'à son expiration quelles que soient les actions entreprises côté
serveur. Une suppression de compte, une déconnexion à distance ou la révocation d'un
appareil compromis ne prennent effet qu'à l'expiration du jeton. Pour une application
soumise au droit à l'effacement sur des données de mineurs, cette latence est un défaut
de conception, pas un compromis de performance.

**Le seul argument en faveur du modèle sans état ne s'applique pas ici.** L'intérêt du
JWT est de permettre à plusieurs services de vérifier une identité sans consulter un
magasin central. L'architecture est monolithique et le seul consommateur est
l'application mobile : la vérification centralisée ne coûte rien et la complexité du
couple jeton d'accès / jeton de renouvellement n'achète aucune propriété utile.

**La fonction de dérivation de clé par défaut de la bibliothèque est scrypt**, une
fonction à coût mémoire listée par l'OWASP comme alternative acceptable lorsque
Argon2id n'est pas disponible. Son implémentation en JavaScript pur évite une
compilation native dans l'image de conteneur. Les paramètres de coût sont à vérifier
contre les recommandations OWASP en vigueur ; la fonction de hachage est surchargeable
si un relèvement s'avère nécessaire.

## Conséquences

- Chaque requête authentifiée entraîne une lecture de la table des sessions. Charge
  négligeable au regard du volume attendu, et compensée par un index sur le jeton de
  session.
- La bibliothèque gère ses propres tables (`user`, `session`, `account`,
  `verification`). La table `user` tient lieu de `PARENT` : `prenom` et `nom_famille`
  sont déclarés en champs additionnels, `email_verifie` correspond à `emailVerified`,
  et le mot de passe est stocké dans `account`. L'entité `PARENT` du modèle logique
  n'existe donc pas comme table distincte, et `enfant.parent_id` référence `user.id`.
- Le montage sur Fastify requiert un adaptateur : la bibliothèque expose un gestionnaire
  au standard Web Fetch, Fastify manipule les objets Node. Trois points d'attention :
  désactiver l'analyse du corps de requête sur la route d'authentification, recopier
  **tous** les en-têtes `Set-Cookie` et non le premier, monter la route en joker.
- Côté mobile, le plugin Expo n'attache automatiquement le cookie de session qu'aux
  requêtes du client d'authentification. Les appels vers les routes métier doivent lire
  le cookie depuis le trousseau et l'ajouter explicitement à leurs en-têtes. La lecture
  est asynchrone.
