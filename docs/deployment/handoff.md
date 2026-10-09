# Handoff — deploying Pousse (staging per PR, production per tag)

Handoff document for a future session. It records the decisions already
made, what is left to settle with the user, and the steps to set up two
deployed environments: **staging**, deployed by the CI of each pull request,
and **production**, deployed by a version tag.

Written on 2026-09-16 (translated to English on 2026-10-04). Prices
and limits quoted were checked on that date: check them again before
committing to anything.

## Repository state at handoff time

- `main` holds the PWA manifest (`apps/mobile/public/manifest.json`,
  `apps/mobile/src/app/+html.tsx`) and ADR-0010 "PWA first, native later"
  (PR #4, merged).
- `.github/workflows/ci.yml` runs lint, format, typecheck and build on every
  PR; the test step is commented out.
  _Update 2026-10-09:_ it now also runs the API integration tests
  (`npm test`, PostgreSQL through Testcontainers on the runner's Docker).
- The API (`apps/api`) runs in Docker (`apps/api/Dockerfile`, `runtime`
  target, `GET /health` probe). Modules are mounted **at the root**
  (`/auth`, `/journal`, …), without an `/api` prefix. BetterAuth is not wired
  yet.
- The client (`apps/mobile`) still runs on in-memory repositories: no HTTP
  adapter. The first web staging is therefore a standalone demo, with the
  API deployed alongside but not called yet.
- The main working folder may hold another session's work in progress:
  start from a fresh branch created from `origin/main`.

## Accepted decisions

| Topic      | Decision                                                                      | Why                                                                                                                              |
| ---------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Client     | PWA from `npx expo export -p web`                                             | ADR-0010                                                                                                                         |
| Web        | **Cloudflare Workers + static assets** (free plan)                            | Requests to static files are free and unlimited. Cloudflare recommends Workers over Pages for any new project.                   |
| API        | **Scaleway Serverless Containers**, `fr-par` region, existing `runtime` image | French host (data about minors), monthly free tier                                                                               |
| Scaling    | **`min-scale 0` in staging AND in production**                                | User's choice (2026-09-16): cold starts are accepted during development. Switch back to `min-scale 1` the day real users arrive. |
| Database   | **Scaleway Serverless SQL Database**, one database per environment            | Same provider, sleeps when idle, pay-per-use billing                                                                             |
| Staging    | Deployed by the PR CI                                                         | User's request                                                                                                                   |
| Production | Deployed by a `vX.Y.Z` tag pushed on `main`                                   | User's request                                                                                                                   |

**Why the API doesn't go on Workers:** the free plan limits each request to
10 ms of CPU. BetterAuth's scrypt hashing goes well beyond that, and Fastify
expects a Node server.

**Expected budget:** everything scales to zero. Compute fits within the
Scaleway free tier (200,000 vCPU-s and 400,000 GB-s per month), and storage
for both databases costs a few tens of cents per month. Only the domain
name, once bought, costs about €10 per year.

**Cold start consequence:** the first request after a period of inactivity
wakes up the container, then the database, and can take several seconds.
Any automated check (smoke test) must therefore retry for at least 60
seconds before declaring a failure.

## Questions to ask the user before writing code

Ask them at the start of the session: each answer changes what gets built.

> **Answers (2026-09-16)**: (1) same origin, with an `/api` relay;
> (2) the workflow runs on every PR, but its deploy job waits for manual
> approval (required reviewer on `staging`); (3) no manual approval in
> production, the tag is enough; (4) domain later; (5) Scaleway Serverless
> SQL. Steps 1, 3, 4 and 5 are written on the `chore/deploiement` branch
> (ADR-0011).

1. **Web and API on the same origin?** Recommended: the Worker serving the
   PWA forwards `/api/*` to the Scaleway container (see "`/api` relay"
   below). The session cookie becomes first-party, there's no more CORS, and
   staging works without a domain name. The alternative is a bought domain,
   with `app.` and `api.` subdomains.
2. **Staging on every PR push, or only on PRs carrying a label**
   (`deploy:staging`)? Staging is single and shared: the last deployed PR
   wins.
3. **Manual approval before production?** The repo is public, so GitHub
   Environments' required reviewers are available for free.
4. **Domain name now or later?** Meanwhile, `*.workers.dev` URLs are enough
   if answer 1 is "same origin".
5. **Database: Scaleway Serverless SQL or Neon** (free tier, 0.5 GB, US
   company, Frankfurt region)?

## Target architecture

|                    | Staging                                                    | Production                                          |
| ------------------ | ---------------------------------------------------------- | --------------------------------------------------- |
| Trigger            | PR against `main` (opened, updated, reopened) + manual run | `v*.*.*` tag whose commit is on `main`              |
| GitHub Environment | `staging`                                                  | `production`                                        |
| Web Worker         | `pousse-web-staging`                                       | `pousse-web`                                        |
| URL                | `pousse-web-staging.<subdomain>.workers.dev`               | `pousse-web.<subdomain>.workers.dev`, then a domain |
| Container          | `pousse-api-staging`, `min-scale 0`, `max-scale 1`         | `pousse-api`, `min-scale 0`, `max-scale 1`          |
| Image tag          | `staging-<short sha>`                                      | `<tag>` (e.g. `v0.1.0`)                             |
| Database           | `pousse-staging`, resettable, fake data                    | `pousse-prod`, backups enabled                      |

Shared image registry: `rg.fr-par.scw.cloud/pousse/api`.

## Step 1 — Prepare the code

Work on a branch created from `origin/main`.

1. **Migrations from CI.** The `db:migrate` script calls `drizzle-kit`, a
   devDependency missing from the `runtime` image, and the
   `apps/api/drizzle/` folder isn't copied into it. Run migrations **from the
   GitHub runner** instead, where `npm ci` installs devDependencies:
   `npm run db:migrate -w apps/api` with `DATABASE_URL` pointing to the
   target database. The image doesn't need to change.
2. **`/api` relay** (if answer 1 is "same origin"):
   - `apps/mobile/wrangler.jsonc`: `main` points to the Worker,
     `assets.directory` to `./dist`, `assets.binding` is `ASSETS`,
     `assets.run_worker_first` is `["/api/*"]`, and `assets.html_handling`
     keeps the default behavior (the static export produces one HTML file
     per route). The `env.staging` and `env.production` sections give the
     Worker name and the `API_ORIGIN` variable.
   - The Worker strips the `/api` prefix and forwards the request as is
     (method, body, headers, `Cookie`) to `API_ORIGIN`, adding
     `X-Forwarded-Host` and `X-Forwarded-Proto`. It returns the response
     without touching `Set-Cookie`. Any other request goes to
     `env.ASSETS.fetch(request)`.
     _Update 2026-10-09:_ it also sets `X-Client-IP` from
     `CF-Connecting-IP`, always overwriting the client's value. BetterAuth
     reads it for rate limiting: `X-Forwarded-For` holds several addresses
     behind Cloudflare and Scaleway, so BetterAuth found no IP and shared a
     single bucket between every client. The container URL being public,
     the header can still be forged by calling the API directly — to close
     once the API is only reachable through the Worker.
   - Stripping the prefix keeps Fastify routes at the root, as today.
     BetterAuth's `basePath` matches the path the API sees (`/auth`).
     _Update 2026-10-04:_ its `baseURL` (`BETTER_AUTH_URL`) is the public
     origin **without a path** — a path in `baseURL` would override
     `basePath` and break routing.
   - `apps/mobile/tsconfig.json` includes every `.ts`: type the `env` object
     by hand (an interface with `fetch(request: Request)`) rather than with
     `@cloudflare/workers-types`, to add no dependency.
3. **Reusable `ci.yml`**: add the `workflow_call` trigger so the deploy
   workflows reuse the same checks instead of duplicating them.
4. **API environment variables**: `PORT`, `DATABASE_URL`,
   `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL`
   (`apps/api/src/shared/config/env.ts`). The last two arrived with
   authentication (2026-10-04).

Done when: `npm run lint`, `npm run format:check` and `npm run typecheck`
pass; `npx expo export -p web` produces `dist/`; and `npx wrangler dev`, run
from `apps/mobile`, serves the PWA locally and forwards `/api/health` to the
API started by `docker compose up`.

## Step 2 — Actions only the user can take

These actions need their accounts. Guide them; the `wizard` skill fits well
here. Never type a password, a key or a payment method yourself.

**Cloudflare**

- Create an account and pick the `workers.dev` subdomain.
- Create an API token with the "Workers Scripts: Edit" permission; note the
  account ID.

**Scaleway**

- Create a `pousse` project and an IAM application dedicated to CI, with
  rights on Container Registry, Serverless Containers and Serverless SQL.
  Generate its API key.
- Create the **private** `pousse` registry namespace in `fr-par`.
- Create a Serverless Containers namespace, then the `pousse-api-staging`
  and `pousse-api` containers: port 3000, `min-scale 0`, `max-scale 1`,
  0.25 vCPU and 512 MB (scrypt is hungry), probe on `/health`. Note their
  IDs and URLs.
- Create the `pousse-staging` and `pousse-prod` databases and note their
  connection strings.
- Enable a **budget alert** on the project.

**GitHub** (`VictorLpr/Pousse` repo)

- Create the `staging` and `production` environments. If answer 3 is yes,
  add a required reviewer on `production`; in every case, restrict
  `production` to `v*.*.*` tags.

Done when every value in the table below is stored in GitHub and the user
has confirmed it.

| Name                                                    | Scope            | Type   |
| ------------------------------------------------------- | ---------------- | ------ |
| `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`         | repository       | secret |
| `SCW_ACCESS_KEY`, `SCW_SECRET_KEY`                      | repository       | secret |
| `SCW_DEFAULT_PROJECT_ID`, `SCW_DEFAULT_ORGANIZATION_ID` | repository       | secret |
| `DATABASE_URL`                                          | each environment | secret |
| `SCW_CONTAINER_ID`                                      | each environment | secret |
| `API_ORIGIN` (public URL of the container)              | each environment | secret |
| `BETTER_AUTH_SECRET` (`openssl rand -base64 32`)        | each environment | secret |
| `BETTER_AUTH_URL` (public web origin, no path)          | each environment | secret |

## Step 3 — Staging workflow

File: `.github/workflows/deploy-staging.yml`.

- Triggers: `pull_request` against `main` (types `opened`, `synchronize`,
  `reopened`) and `workflow_dispatch`.
- Guard: only runs if
  `github.event.pull_request.head.repo.full_name == github.repository`. A PR
  from a fork has no access to secrets.
- `concurrency: { group: deploy-staging, cancel-in-progress: false }`:
  deploys queue up instead of being cancelled mid-migration.
- `environment: staging`; permissions `contents: read` and
  `pull-requests: write` (for the comment).
- Jobs, in order:
  1. **checks**: call `ci.yml` (`uses: ./.github/workflows/ci.yml`).
  2. **api**:
     - `docker build --target runtime -f apps/api/Dockerfile .` then push
       `rg.fr-par.scw.cloud/pousse/api:staging-<short sha>` (registry login:
       user `nologin`, password `SCW_SECRET_KEY`);
     - `npm ci`, then `npm run db:migrate -w apps/api` with the
       environment's `DATABASE_URL`;
     - with the official `scaleway/action-scw` action:
       `container container update <id> registry-image=<image>` then
       `container container deploy <id>`.
  3. **web**:
     - `npx expo export -p web` in `apps/mobile`;
     - `cloudflare/wrangler-action`, command `deploy --env staging`.
  4. **smoke**:
     - `curl --retry 12 --retry-delay 5 --retry-all-errors` on the web URL
       and on `<web>/api/health` (otherwise directly on
       `API_ORIGIN/health`);
     - a PR comment with the URL and the deployed SHA, updated on each push
       rather than repeated.

**Shared staging and migrations.** Drizzle can't roll back a migration. A PR
abandoned after deployment therefore leaves its schema in the staging
database. Add a `reset-staging-db.yml` workflow, run manually, that wipes the
staging database and replays the migrations of `main`. Never give it access
to `production` secrets.

Done when a test PR shows the green workflow, a comment with the staging
URL, and `<web>/api/health` answers 200.

## Step 4 — Production workflow

File: `.github/workflows/deploy-production.yml`. It reuses the staging
structure, with these differences:

- Triggers: `push` of `v*.*.*` tags, and `workflow_dispatch` with a `tag`
  field to redeploy an earlier version.
- First step: `git fetch origin main` then
  `git merge-base --is-ancestor "$GITHUB_SHA" origin/main`. If the tag's
  commit isn't on `main`, the workflow fails.
- `environment: production`, concurrency group `deploy-production`.
- Image tag: the tag name. Worker: `deploy --env production`.
- No PR comment; create a GitHub Release from the tag.

**Rollback:** run the workflow manually with the previous tag. The web app
and the container roll back, **not the database**. Every migration must
therefore stay compatible with the previous version of the code: add first,
remove in a later version (expand/contract).

Done when the `v0.1.0` tag pushed on `main` deploys production,
`<prod web>/api/health` answers 200, and a tag pushed on a commit outside
`main` is refused.

## Step 5 — Document

- Write a "Hosting and deployment" ADR (next free number in `docs/adr/`,
  index to update): it covers the accepted decisions, the user's answers,
  the rejected alternatives (Render, Fly.io, Railway, VPS) and the costs,
  **including** the accepted cold start.
- Add a "Deploying" section to the root `README.md`: opening a PR deploys
  staging, `git tag vX.Y.Z && git push origin vX.Y.Z` deploys production.

Done when the ADR is accepted in the index and the README section describes
both triggers.

## Sources

- [Cloudflare Workers — pricing and limits](https://developers.cloudflare.com/workers/platform/pricing/)
- [Cloudflare Pages — Workers recommended for new projects](https://developers.cloudflare.com/pages/)
- [Workers static assets — `run_worker_first`](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/)
- [Workers — preview URLs](https://developers.cloudflare.com/workers/configuration/previews/)
- [Scaleway — Serverless pricing](https://www.scaleway.com/en/pricing/serverless/)
- [Scaleway CLI — `container` commands](https://github.com/scaleway/scaleway-cli/blob/master/docs/commands/container.md)
- [Official `scaleway/action-scw` action](https://github.com/scaleway/action-scw)
- "Pousse in production" audit: https://claude.ai/artifact/HEn9CThMWyQpjEJcGe8gum
