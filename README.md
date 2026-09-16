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

## Déployer

Voir [ADR-0011](docs/adr/0011-hebergement-et-deploiement.md) : PWA sur
Cloudflare Workers, API et base sur Scaleway.

- **Staging** : ouvrir ou mettre à jour une PR vers `main` lance
  « Déploiement staging ». Le job de déploiement attend ton approbation
  (« Review deployments » dans l'onglet Actions) : approuve pour déployer,
  ou laisse-le en attente. L'URL est commentée sur la PR.
- **Production** : poser un tag de version sur un commit de `main`.

  ```bash
  git tag v0.1.0 && git push origin v0.1.0
  ```

- **Retour arrière** : lancer « Déploiement production » à la main avec le
  tag précédent. La base ne revient pas en arrière.
- **Base de staging** : « Réinitialiser la base de staging » la vide et
  rejoue les migrations de `main`.

Pour tester le Worker en local (API lancée par `docker compose up`) :

```bash
cd apps/mobile && npx expo export -p web && npx wrangler dev
```

## Documentation

- [`docs/adr/`](docs/adr/README.md) : historique des décisions d'architecture,
  y compris le choix d'Expo (ADR-0008), l'organisation en monorepo
  (ADR-0009) et la livraison en PWA d'abord, natif ensuite (ADR-0010).
- [`apps/mobile/AGENTS.md`](apps/mobile/AGENTS.md) et
  [`apps/api/AGENTS.md`](apps/api/AGENTS.md) : règles d'architecture et de
  convention propres à chaque application.
