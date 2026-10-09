# Pousse — monorepo

Pousse is a parent/child evening-ritual app: an Expo mobile client and a
Fastify API, built together by a single person. The repo is an npm workspaces
monorepo (ADR-0009) — see `docs/adr/` for every accepted architecture
decision, including the choice of Expo (ADR-0008) and shipping as a PWA
first, native later (ADR-0010).

```
apps/
  mobile/   Expo client (React Native, expo-router) — see apps/mobile/AGENTS.md
  api/      Fastify + Drizzle + BetterAuth API — see apps/api/AGENTS.md
docs/
  adr/          architecture decisions (Nygard format), shared by both apps
  data-model/   conceptual/logical data model (Merise)
  deployment/   deployment handoff notes
```

**Each application has its own rules, not repeated here**:
`apps/mobile/AGENTS.md` (hexagonal architecture per business module, "Cocon"
design system, accessibility) and `apps/api/AGENTS.md` (Fastify, Drizzle,
modular split, testing strategy) are the reference for any work in their
folder. Don't work in `apps/mobile` or `apps/api` without reading the
matching file.

## Root commands

```bash
npm install               # installs both workspaces
npm run mobile:web        # starts the Expo client (web)
docker compose up --build # PostgreSQL + migrations + API (watch) on :3000
npm run db:generate -w apps/api   # generates a migration from the Drizzle schema
npm run typecheck         # tsc --noEmit on every workspace that exposes it
npm test                  # test suites of every workspace (API: needs Docker running)
npm run lint              # oxlint on the whole repo
```

## Rules shared by both applications

- **Language: English everywhere.** Identifiers (variables, functions,
  classes, methods, types, files, folders, modules, routes, query
  parameters), database names (tables, columns, enum and code values), error
  and log messages, comments, configuration, CI and documentation are all
  written in English. **Two exceptions stay in French**: the mobile app's
  UI copy (labels, buttons, accessibility labels, display copy derived from
  error codes, demo content), and the ADRs in `docs/adr/`. Before finishing
  a change, check that no French word slipped outside those exceptions — a
  French column name, error message or comment is a bug to fix, not a style
  nit.
- The ADRs use French names that the code writes in English: `prenom` →
  `first_name`, `nom_famille` → `last_name` (ADR-0003); modules `defis` →
  `challenges`, `souvenirs` → `memories`, `lettres` → `letters` (ADR-0006).
  The ADRs aren't edited for that: use the English names in the code.
- Strict TypeScript everywhere; `tsconfig.base.json` at the root holds the
  shared options, each application extends it.
- Kebab-case file names, one entity/use case/component/route per file.
- No new dependency without a strong reason.
- An ADR is never edited, it is superseded (see `docs/adr/README.md`).
