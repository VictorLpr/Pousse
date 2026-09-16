# Pousse — monorepo

Pousse est une application de rituel du soir parent/enfant : un client mobile
Expo et une API Fastify, développés ensemble par une seule personne. Le dépôt
est un monorepo npm workspaces (ADR-0009) — voir `docs/adr/` pour l'ensemble
des décisions d'architecture actées, y compris le choix d'Expo (ADR-0008) et
la livraison en PWA d'abord, natif ensuite (ADR-0010).

```
apps/
  mobile/   client Expo (React Native, expo-router) — voir apps/mobile/AGENTS.md
  api/      API Fastify + Drizzle + BetterAuth (scaffold, pas encore de logique
            métier) — voir apps/api/AGENTS.md
docs/
  adr/            décisions d'architecture (format Nygard), partagées par les deux apps
  modelisation/   modèle conceptuel/logique de données (Merise)
```

**Chaque application a ses propres règles, non répétées ici** :
`apps/mobile/AGENTS.md` (architecture hexagonale par module métier, design
system « Cocon », accessibilité) et `apps/api/AGENTS.md` (Fastify, Drizzle,
découpage modulaire, stratégie de tests) sont la référence pour tout travail
dans leur dossier respectif. Ne travaille pas dans `apps/mobile` ou `apps/api`
sans avoir lu le fichier correspondant.

## Commandes à la racine

```bash
npm install               # installe les deux workspaces
npm run mobile:web        # démarre le client Expo (web)
docker compose up --build # PostgreSQL + migrations + API (watch) sur :3000
npm run db:generate -w apps/api   # génère une migration depuis le schéma Drizzle
npm run typecheck         # tsc --noEmit sur chaque workspace qui l'expose
npm run lint               # oxlint sur tout le dépôt
```

## Règles communes aux deux applications

- TypeScript strict partout ; `tsconfig.base.json` à la racine porte les
  options communes, chaque application l'étend.
- Kebab-case pour les fichiers, un entité/cas d'usage/composant/route par
  fichier.
- Code et messages destinés à l'utilisateur en français.
- Pas de nouvelle dépendance sans raison forte.
- Un ADR ne se modifie pas, il se remplace (voir `docs/adr/README.md`).
