# Passation — déploiement de Pousse (staging par PR, production par tag)

Document de reprise pour une session future. Il fixe les décisions déjà
prises, ce qui reste à trancher avec l'utilisateur, et la démarche pour
mettre en place deux environnements déployés : **staging**, déployé par la CI
de chaque pull request, et **production**, déployée par un tag de version.

Rédigé le 2026-09-16. Les tarifs et limites cités ont été relevés à cette
date : revérifie-les avant de t'engager.

## État du dépôt au moment de la passation

- `main` contient le manifeste PWA (`apps/mobile/public/manifest.json`,
  `apps/mobile/src/app/+html.tsx`) et l'ADR-0010 « PWA d'abord, natif
  ensuite » (PR #4, fusionnée).
- `.github/workflows/ci.yml` lance lint, format, typecheck et build sur chaque
  PR ; l'étape de tests est commentée.
- L'API (`apps/api`) tourne en Docker (`apps/api/Dockerfile`, cible
  `runtime`, sonde `GET /health`). Les modules sont montés **à la racine**
  (`/auth`, `/journal`, …), sans préfixe `/api`. BetterAuth n'est pas encore
  branché.
- Le client (`apps/mobile`) fonctionne encore sur des dépôts en mémoire :
  aucun adaptateur HTTP. Le premier staging web sera donc une démo autonome,
  l'API étant déployée à côté sans être encore appelée.
- Le dossier de travail principal peut porter le travail en cours d'une autre
  session : pars d'une branche neuve créée depuis `origin/main`.

## Décisions actées

| Sujet            | Décision                                                                       | Pourquoi                                                                                                                                                                        |
| ---------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Client           | PWA issue de `npx expo export -p web`                                          | ADR-0010                                                                                                                                                                        |
| Web              | **Cloudflare Workers + static assets** (plan gratuit)                          | Requêtes vers les fichiers statiques gratuites et illimitées. Cloudflare recommande Workers plutôt que Pages pour tout nouveau projet.                                          |
| API              | **Scaleway Serverless Containers**, région `fr-par`, image `runtime` existante | Hébergeur français (données de mineurs), palier gratuit mensuel                                                                                                                 |
| Mise à l'échelle | **`min-scale 0` en staging ET en production**                                  | Choix de l'utilisateur (16/09/2026) : le démarrage à froid est accepté pendant la phase de développement. À repasser à `min-scale 1` le jour où de vrais utilisateurs arrivent. |
| Base             | **Scaleway Serverless SQL Database**, une base par environnement               | Même fournisseur, mise en veille, facturation à l'usage                                                                                                                         |
| Staging          | Déployé par la CI de PR                                                        | Demande de l'utilisateur                                                                                                                                                        |
| Production       | Déployée par un tag `vX.Y.Z` posé sur `main`                                   | Demande de l'utilisateur                                                                                                                                                        |

**Pourquoi l'API ne va pas sur Workers :** le plan gratuit limite chaque
requête à 10 ms de CPU. Le hachage scrypt de BetterAuth les dépasse
largement, et Fastify attend un serveur Node.

**Budget attendu :** tout est en veille à zéro. Le calcul entre dans le
palier gratuit Scaleway (200 000 vCPU‑s et 400 000 Go‑s par mois), et le
stockage des deux bases coûte quelques dizaines de centimes par mois. Seul le
nom de domaine, quand il sera acheté, coûte environ 10 € par an.

**Conséquence du démarrage à froid :** la première requête après une période
d'inactivité réveille le conteneur puis la base, et peut prendre plusieurs
secondes. Toute vérification automatique (smoke test) doit donc réessayer
pendant au moins 60 secondes avant de conclure à un échec.

## Questions à poser à l'utilisateur avant d'écrire du code

Pose-les en début de session : chaque réponse change ce qui est construit.

> **Réponses (16/09/2026)** : (1) même origine, avec relais `/api` ;
> (2) le workflow tourne sur chaque PR, mais son job de déploiement attend
> une approbation manuelle (relecteur obligatoire sur `staging`) ; (3) pas
> de validation manuelle en production, le tag suffit ; (4) domaine plus
> tard ; (5) Scaleway Serverless SQL. Les étapes 1, 3, 4 et 5 sont écrites
> sur la branche `chore/deploiement` (ADR-0011).

1. **Web et API sur la même origine ?** Recommandé : le Worker qui sert la
   PWA relaie `/api/*` vers le conteneur Scaleway (voir « Relais `/api` »
   plus bas). Le cookie de session devient propriétaire, il n'y a plus de
   CORS, et le staging fonctionne sans nom de domaine. L'alternative est un
   domaine acheté, avec `app.` et `api.` en sous-domaines.
2. **Staging sur chaque push de PR, ou seulement sur les PR portant un
   label** (`deploy:staging`) ? Le staging est unique et partagé : c'est la
   dernière PR déployée qui gagne.
3. **Validation manuelle avant la production ?** Le dépôt est public, donc
   les relecteurs obligatoires des GitHub Environments sont disponibles
   gratuitement.
4. **Nom de domaine maintenant ou plus tard ?** En attendant, les URL
   `*.workers.dev` suffisent si la réponse 1 est « même origine ».
5. **Base : Scaleway Serverless SQL ou Neon** (offre gratuite, 0,5 Go,
   société américaine, région Francfort) ?

## Architecture cible

|                    | Staging                                                            | Production                                            |
| ------------------ | ------------------------------------------------------------------ | ----------------------------------------------------- |
| Déclencheur        | PR vers `main` (ouverte, mise à jour, rouverte) + lancement manuel | Tag `v*.*.*` dont le commit est sur `main`            |
| GitHub Environment | `staging`                                                          | `production`                                          |
| Worker web         | `pousse-web-staging`                                               | `pousse-web`                                          |
| URL                | `pousse-web-staging.<sous-domaine>.workers.dev`                    | `pousse-web.<sous-domaine>.workers.dev`, puis domaine |
| Conteneur          | `pousse-api-staging`, `min-scale 0`, `max-scale 1`                 | `pousse-api`, `min-scale 0`, `max-scale 1`            |
| Tag d'image        | `staging-<sha court>`                                              | `<tag>` (ex. `v0.1.0`)                                |
| Base               | `pousse-staging`, réinitialisable, données fictives                | `pousse-prod`, sauvegardes activées                   |

Registre d'images commun : `rg.fr-par.scw.cloud/pousse/api`.

## Étape 1 — Préparer le code

Travaille sur une branche créée depuis `origin/main`.

1. **Migrations depuis la CI.** Le script `db:migrate` appelle `drizzle-kit`,
   une devDependency absente de l'image `runtime`, et le dossier
   `apps/api/drizzle/` n'y est pas copié. Lance donc les migrations **depuis
   le runner GitHub**, où `npm ci` installe les devDependencies :
   `npm run db:migrate -w apps/api` avec `DATABASE_URL` pointant vers la base
   cible. L'image n'a pas à changer.
2. **Relais `/api`** (si la réponse 1 est « même origine ») :
   - `apps/mobile/wrangler.jsonc` : `main` pointe vers le Worker,
     `assets.directory` vers `./dist`, `assets.binding` vaut `ASSETS`,
     `assets.run_worker_first` vaut `["/api/*"]`, et `assets.html_handling`
     garde le comportement par défaut (l'export statique produit un fichier
     HTML par route). Les sections `env.staging` et `env.production` donnent
     le nom du Worker et la variable `API_ORIGIN`.
   - Le Worker retire le préfixe `/api` et relaie la requête telle quelle
     (méthode, corps, en-têtes, `Cookie`) vers `API_ORIGIN`, en ajoutant
     `X-Forwarded-Host` et `X-Forwarded-Proto`. Il renvoie la réponse sans
     toucher aux `Set-Cookie`. Toute autre requête part vers
     `env.ASSETS.fetch(request)`.
   - Retirer le préfixe garde les routes Fastify à la racine, comme
     aujourd'hui. Quand BetterAuth sera branché, son `basePath` devra
     correspondre au chemin vu par l'API (`/auth`), et son `baseURL` à
     l'origine publique suivie de `/api/auth`.
   - `apps/mobile/tsconfig.json` inclut tous les `.ts` : type l'objet `env`
     à la main (une interface avec `fetch(request: Request)`) plutôt
     qu'avec `@cloudflare/workers-types`, pour n'ajouter aucune dépendance.
3. **`ci.yml` réutilisable** : ajoute le déclencheur `workflow_call` pour que
   les workflows de déploiement réutilisent les mêmes vérifications au lieu
   de les dupliquer.
4. **Variables d'environnement de l'API** : aujourd'hui `PORT` et
   `DATABASE_URL` suffisent (`apps/api/src/shared/config/env.ts`). Le secret
   BetterAuth et son URL publique viendront avec le branchement de
   l'authentification.

Terminé quand : `npm run lint`, `npm run format:check` et
`npm run typecheck` passent ; `npx expo export -p web` produit `dist/` ; et
`npx wrangler dev`, lancé depuis `apps/mobile`, sert la PWA en local et
relaie `/api/health` vers l'API démarrée par `docker compose up`.

## Étape 2 — Actions que seul l'utilisateur peut faire

Ces actions demandent ses comptes. Guide-le ; la compétence `wizard` convient
bien ici. Ne saisis jamais toi-même un mot de passe, une clé ou un moyen de
paiement.

**Cloudflare**

- Créer un compte et choisir le sous-domaine `workers.dev`.
- Créer un jeton d'API avec la permission « Workers Scripts : Edit » ;
  relever l'identifiant du compte.

**Scaleway**

- Créer un projet `pousse` et une application IAM dédiée à la CI, avec les
  droits sur Container Registry, Serverless Containers et Serverless SQL.
  Générer sa clé d'API.
- Créer l'espace de registre **privé** `pousse` en `fr-par`.
- Créer un espace Serverless Containers, puis les conteneurs
  `pousse-api-staging` et `pousse-api` : port 3000, `min-scale 0`,
  `max-scale 1`, 0,25 vCPU et 512 Mo (scrypt est gourmand), sonde sur
  `/health`. Relever leurs identifiants et leurs URL.
- Créer les bases `pousse-staging` et `pousse-prod` et relever leurs chaînes
  de connexion.
- Activer une **alerte de budget** sur le projet.

**GitHub** (dépôt `VictorLpr/Pousse`)

- Créer les environments `staging` et `production`. Si la réponse 3 est oui,
  ajouter un relecteur obligatoire sur `production` ; dans tous les cas,
  restreindre `production` aux tags `v*.*.*`.

Terminé quand chaque valeur du tableau ci-dessous est enregistrée dans
GitHub et que l'utilisateur l'a confirmé.

| Nom                                                     | Portée             | Type     |
| ------------------------------------------------------- | ------------------ | -------- |
| `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`         | dépôt              | secret   |
| `SCW_ACCESS_KEY`, `SCW_SECRET_KEY`                      | dépôt              | secret   |
| `SCW_DEFAULT_PROJECT_ID`, `SCW_DEFAULT_ORGANIZATION_ID` | dépôt              | secret   |
| `DATABASE_URL`                                          | chaque environment | secret   |
| `SCW_CONTAINER_ID`                                      | chaque environment | secret   |
| `API_ORIGIN` (URL publique du conteneur)                | chaque environment | secret   |

## Étape 3 — Workflow de staging

Fichier : `.github/workflows/deploy-staging.yml`.

- Déclencheurs : `pull_request` vers `main` (types `opened`, `synchronize`,
  `reopened`) et `workflow_dispatch`.
- Garde-fou : ne s'exécute que si
  `github.event.pull_request.head.repo.full_name == github.repository`. Une
  PR venue d'un fork n'a pas accès aux secrets.
- `concurrency: { group: deploy-staging, cancel-in-progress: false }` : les
  déploiements se mettent en file d'attente au lieu de s'interrompre en
  pleine migration.
- `environment: staging` ; permissions `contents: read` et
  `pull-requests: write` (pour le commentaire).
- Tâches, dans l'ordre :
  1. **checks** : appel de `ci.yml` (`uses: ./.github/workflows/ci.yml`).
  2. **api** :
     - `docker build --target runtime -f apps/api/Dockerfile .` puis push de
       `rg.fr-par.scw.cloud/pousse/api:staging-<sha court>` (connexion au
       registre : utilisateur `nologin`, mot de passe `SCW_SECRET_KEY`) ;
     - `npm ci`, puis `npm run db:migrate -w apps/api` avec le
       `DATABASE_URL` de l'environment ;
     - avec l'action officielle `scaleway/action-scw` :
       `container container update <id> registry-image=<image>` puis
       `container container deploy <id>`.
  3. **web** :
     - `npx expo export -p web` dans `apps/mobile` ;
     - `cloudflare/wrangler-action`, commande `deploy --env staging`.
  4. **smoke** :
     - `curl --retry 12 --retry-delay 5 --retry-all-errors` sur l'URL du web
       et sur `<web>/api/health` (sinon directement sur `API_ORIGIN/health`) ;
     - commentaire sur la PR avec l'URL et le SHA déployé, mis à jour à chaque
       push plutôt que répété.

**Staging partagé et migrations.** Drizzle ne sait pas annuler une
migration. Une PR abandonnée après déploiement laisse donc son schéma dans
la base de staging. Ajoute un workflow `reset-staging-db.yml`, lancé à la
main, qui vide la base de staging puis rejoue les migrations de `main`. Ne
lui donne jamais accès aux secrets de `production`.

Terminé quand une PR de test affiche le workflow vert, un commentaire avec
l'URL de staging, et que `<web>/api/health` répond 200.

## Étape 4 — Workflow de production

Fichier : `.github/workflows/deploy-production.yml`. Il reprend la
structure du staging, avec ces différences :

- Déclencheurs : `push` de tags `v*.*.*`, et `workflow_dispatch` avec un
  champ `tag` pour redéployer une version antérieure.
- Première étape : `git fetch origin main` puis
  `git merge-base --is-ancestor "$GITHUB_SHA" origin/main`. Si le commit du
  tag n'est pas sur `main`, le workflow s'arrête en échec.
- `environment: production`, groupe de concurrence `deploy-production`.
- Tag d'image : le nom du tag. Worker : `deploy --env production`.
- Pas de commentaire de PR ; crée une GitHub Release à partir du tag.

**Retour arrière :** lance le workflow à la main avec le tag précédent. Le
web et le conteneur reviennent en arrière, **pas la base**. Chaque migration
doit donc rester compatible avec la version précédente du code : on ajoute
d'abord, on supprime dans une version ultérieure (expand/contract).

Terminé quand le tag `v0.1.0` posé sur `main` déploie la production, que
`<web prod>/api/health` répond 200, et qu'un tag posé sur un commit hors
`main` est refusé.

## Étape 5 — Documenter

- Rédige un ADR « Hébergement et déploiement » (prochain numéro libre dans
  `docs/adr/`, index à mettre à jour) : il reprend les décisions actées, les
  réponses de l'utilisateur, les alternatives écartées (Render, Fly.io,
  Railway, VPS) et les coûts, **y compris** le démarrage à froid accepté.
- Ajoute au `README.md` racine une section « Déployer » : ouvrir une PR
  déploie le staging, `git tag vX.Y.Z && git push origin vX.Y.Z` déploie la
  production.

Terminé quand l'ADR est accepté dans l'index et que la section du README
décrit les deux déclencheurs.

## Sources

- [Cloudflare Workers — tarifs et limites](https://developers.cloudflare.com/workers/platform/pricing/)
- [Cloudflare Pages — recommandation de Workers pour les nouveaux projets](https://developers.cloudflare.com/pages/)
- [Workers static assets — `run_worker_first`](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/)
- [Workers — URL de prévisualisation](https://developers.cloudflare.com/workers/configuration/previews/)
- [Scaleway — tarifs Serverless](https://www.scaleway.com/en/pricing/serverless/)
- [Scaleway CLI — commandes `container`](https://github.com/scaleway/scaleway-cli/blob/master/docs/commands/container.md)
- [Action officielle `scaleway/action-scw`](https://github.com/scaleway/action-scw)
- Audit « Pousse en production » : https://claude.ai/artifact/HEn9CThMWyQpjEJcGe8gum
