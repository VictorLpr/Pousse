# Pousse 🌱

The evening ritual, together — an npm workspaces monorepo (ADR-0009) holding
the mobile client and the API.

```
apps/
  mobile/   React Native + Expo, built from the "Cocon" mockup — see apps/mobile/README.md
  api/      Fastify + Drizzle + BetterAuth API — see apps/api/AGENTS.md
docs/
  adr/          architecture decisions
  data-model/   conceptual/logical data model (Merise)
  deployment/   deployment handoff notes
```

## Running the project

```bash
npm install
npm run mobile:web       # Expo client (web) — or npm run mobile to pick Android/iOS/web
docker compose up --build # PostgreSQL + migrations + API (watch) on :3000
```

## Deploying

See [ADR-0011](docs/adr/0011-hebergement-et-deploiement.md): PWA on
Cloudflare Workers, API and database on Scaleway.

- **Staging**: opening or updating a PR against `main` runs
  "Deploy staging". The deploy job waits for your approval ("Review
  deployments" in the Actions tab): approve to deploy, or leave it pending.
  The URL is posted as a PR comment.
- **Production**: push a version tag on a commit of `main`.

  ```bash
  git tag v0.1.0 && git push origin v0.1.0
  ```

- **Rollback**: run "Deploy production" manually with the previous tag. The
  database is not rolled back.
- **Staging database**: "Reset staging database" wipes it and replays the
  migrations of `main`.

To try the Worker locally (API started by `docker compose up`):

```bash
cd apps/mobile && npx expo export -p web && npx wrangler dev
```

## Documentation

- [`docs/adr/`](docs/adr/README.md): history of architecture decisions,
  including the choice of Expo (ADR-0008), the monorepo layout (ADR-0009),
  shipping as a PWA first, native later (ADR-0010) and English as the code
  language (ADR-0012).
- [`apps/mobile/AGENTS.md`](apps/mobile/AGENTS.md) and
  [`apps/api/AGENTS.md`](apps/api/AGENTS.md): architecture and convention
  rules specific to each application.
