# Pousse 🌱

Le rituel du soir, ensemble — monorepo npm workspaces (ADR-0009) contenant le
client mobile et l'API.

```
apps/
  mobile/   React Native + Expo, issu de la maquette « Cocon » — voir apps/mobile/README.md
  api/      API Fastify + Drizzle + BetterAuth (scaffold) — voir apps/api/AGENTS.md
docs/
  adr/            décisions d'architecture
  modelisation/   modèle conceptuel/logique de données (Merise)
```

## Lancer le projet

```bash
npm install
npm run mobile:web   # client Expo (web) — ou npm run mobile pour choisir Android/iOS/web
npm run api          # API en mode watch (scaffold, pas encore de route métier)
```

## Documentation

- [`docs/adr/`](docs/adr/README.md) : historique des décisions d'architecture,
  y compris le choix d'Expo (ADR-0008), l'organisation en monorepo
  (ADR-0009) et la livraison en PWA d'abord, natif ensuite (ADR-0010).
- [`apps/mobile/AGENTS.md`](apps/mobile/AGENTS.md) et
  [`apps/api/AGENTS.md`](apps/api/AGENTS.md) : règles d'architecture et de
  convention propres à chaque application.
