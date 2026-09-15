# syntax=docker/dockerfile:1


ARG NODE_VERSION=24

# --- Dépendances complètes (build) -----------------------------------------
FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /repo
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/mobile/package.json apps/mobile/
RUN --mount=type=cache,target=/root/.npm \
    npm ci --workspace @pousse/api --include-workspace-root=false

# --- Développement (compose.yaml) -------------------------------------------
# Le code de apps/api est monté en volume : l'image ne porte que les
# dépendances. `tsx watch` recharge à chaque modification.
FROM deps AS dev
COPY tsconfig.base.json ./
WORKDIR /repo/apps/api
EXPOSE 3000
CMD ["npm", "run", "dev"]

# --- Compilation TypeScript -------------------------------------------------
FROM deps AS build
COPY tsconfig.base.json ./
COPY apps/api/tsconfig.json apps/api/tsconfig.build.json apps/api/
COPY apps/api/src apps/api/src
RUN npm run build --workspace @pousse/api

# --- Dépendances de production uniquement -----------------------------------
FROM node:${NODE_VERSION}-alpine AS prod-deps
WORKDIR /repo
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/mobile/package.json apps/mobile/
RUN --mount=type=cache,target=/root/.npm \
    npm ci --workspace @pousse/api --include-workspace-root=false --omit=dev

# --- Image finale -----------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS runtime
ENV NODE_ENV=production \
    PORT=3000
WORKDIR /repo
# Manifestes + node_modules, à la racine ET dans apps/api (npm peut y placer
# une version non remontée en cas de conflit). apps/api/package.json est
# requis à l'exécution : il porte le mapping `imports` (#/*).
COPY --from=prod-deps --chown=node:node /repo ./
COPY --from=build --chown=node:node /repo/apps/api/dist apps/api/dist
WORKDIR /repo/apps/api
USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1:3000/health || exit 1
CMD ["node", "dist/server.js"]
