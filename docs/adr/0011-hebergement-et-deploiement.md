# ADR-0011 — Hébergement et déploiement

- **Statut** : Accepté
- **Date** : 2026-09-16

## Contexte

Pousse doit être déployé pour être montré : la PWA (ADR-0010), l'API
Fastify (ADR-0001) et sa base PostgreSQL (ADR-0002). Le projet est mené par
une seule personne, avec un budget minimal. L'application stocke des
données de mineurs, qu'on veut héberger en France.

Il faut deux environnements : un **staging** pour essayer une PR avant de la
fusionner, et une **production**.

Contraintes techniques :

- l'export web d'Expo est un site statique (un fichier HTML par route) ;
- l'API est un serveur Node conteneurisé (`apps/api/Dockerfile`, cible
  `runtime`) ;
- BetterAuth hache les mots de passe avec scrypt, qui consomme beaucoup de
  CPU à chaque requête.

## Décision

**Web : Cloudflare Workers avec static assets (plan gratuit).** Les requêtes
vers les fichiers statiques sont gratuites et illimitées. Cloudflare
recommande Workers plutôt que Pages pour tout nouveau projet. Le Worker
(`apps/mobile/worker/index.ts`) sert la PWA et **relaie `/api/*` vers
l'API**, préfixe retiré. Le web et l'API partagent ainsi la même origine :
pas de CORS, un cookie de session servi par le site lui-même, et aucun nom
de domaine n'est nécessaire tant que les URL `*.workers.dev` suffisent.

**API : Scaleway Serverless Containers (`fr-par`)**, avec l'image `runtime`
publiée dans le registre privé `rg.fr-par.scw.cloud/pousse/api`. Les
conteneurs sont configurés avec `min-scale 0` et `max-scale 1`, **en staging
comme en production**.

**Base : Scaleway Serverless SQL Database**, une base par environnement
(`pousse-staging`, `pousse-prod`).

**Déclencheurs :**

- **staging** : le workflow `deploy-staging.yml` tourne sur chaque PR vers
  `main`, mais son job de déploiement attend une approbation manuelle
  (relecteur obligatoire sur l'environment GitHub `staging`). On choisit
  ainsi quelles PR déployer. Le staging est unique : la dernière PR
  déployée l'occupe. `reset-staging-db.yml` vide la base de staging et
  rejoue les migrations de `main` ;
- **production** : un tag `vX.Y.Z` posé sur un commit de `main` déclenche
  `deploy-production.yml`, sans validation manuelle. Un tag posé hors de
  `main` est refusé. Pour revenir en arrière, on relance ce workflow à la
  main avec un tag antérieur.

Les migrations Drizzle sont appliquées depuis le runner GitHub, où
`drizzle-kit` est installé, et non depuis l'image `runtime`, qui ne le
contient pas.

**Alternatives écartées :**

- **API sur Cloudflare Workers** : le plan gratuit limite chaque requête à
  10 ms de CPU, bien moins que ce que demande scrypt, et Fastify attend un
  serveur Node ;
- **Render, Railway, Fly.io** : sociétés américaines, sans palier gratuit
  qui tienne pour une base, ou alors avec une veille qui efface les données ;
- **VPS** : coût fixe, et système, sauvegardes et TLS à maintenir soi-même ;
- **Neon pour la base** : gratuit, mais société américaine et hébergement à
  Francfort ;
- **domaine séparé `app.` / `api.`** : oblige à acheter un domaine
  immédiatement et à gérer CORS et les cookies entre sous-domaines.

## Conséquences

- **Coût** : le calcul des conteneurs entre dans le palier gratuit mensuel
  de Scaleway (200 000 vCPU‑s et 400 000 Go‑s, tarifs relevés en
  septembre 2026). Celui des bases ne l'est pas : il est facturé
  0,1375 € par vCPU‑heure active, et le stockage 0,000272 € par Go‑heure.
  Avec l'usage d'un développement, les deux bases devraient coûter de 1 à
  3 € par mois ; leur autoscaling est plafonné à 1 vCPU. Un nom de domaine,
  s'il est acheté, coûte environ 10 € par an. Une alerte de budget est posée
  sur le projet Scaleway : une base maintenue éveillée en continu coûterait
  environ 99 € par mois.
- **Démarrage à froid accepté, y compris en production.** Après une période
  d'inactivité, la première requête réveille le conteneur puis la base, et
  peut prendre plusieurs secondes. Les tests de fumée réessaient donc
  pendant 60 secondes. Il faudra passer la production à `min-scale 1`
  (payant) quand de vrais utilisateurs arriveront.
- **La base ne revient pas en arrière** lors d'un retour arrière. Chaque
  migration doit rester compatible avec la version précédente du code : on
  ajoute d'abord, on supprime dans une version ultérieure
  (expand/contract).
- **Un staging partagé** : deux PR ne peuvent pas être essayées en même
  temps, et une PR abandonnée laisse son schéma en base jusqu'à la
  réinitialisation.
- **Dépendance à deux fournisseurs** (Cloudflare et Scaleway) et à leurs
  actions GitHub. Le Worker est volontairement minimal : il sert des
  fichiers et relaie des requêtes, ce qui le rend facile à remplacer.
- **Quand BetterAuth sera branché**, son `basePath` devra valoir `/auth`
  (le chemin vu par l'API), et son `baseURL` l'origine publique suivie de
  `/api/auth`.
