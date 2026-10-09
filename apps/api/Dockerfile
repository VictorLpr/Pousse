# syntax=docker/dockerfile:1


ARG NODE_VERSION=24

# --- Full dependencies (build) ---------------------------------------------
FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /repo
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/mobile/package.json apps/mobile/
RUN --mount=type=cache,target=/root/.npm \
    npm ci --workspace @pousse/api --include-workspace-root=false

# --- Development (compose.yaml) --------------------------------------------
# apps/api code is mounted as a volume: the image only carries the
# dependencies. `tsx watch` reloads on every change.
FROM deps AS dev
COPY tsconfig.base.json ./
WORKDIR /repo/apps/api
EXPOSE 3000
CMD ["npm", "run", "dev"]

# --- TypeScript compilation ------------------------------------------------
FROM deps AS build
COPY tsconfig.base.json ./
COPY apps/api/tsconfig.json apps/api/tsconfig.build.json apps/api/
COPY apps/api/src apps/api/src
RUN npm run build --workspace @pousse/api

# --- Production dependencies only ------------------------------------------
FROM node:${NODE_VERSION}-alpine AS prod-deps
WORKDIR /repo
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/mobile/package.json apps/mobile/
RUN --mount=type=cache,target=/root/.npm \
    npm ci --workspace @pousse/api --include-workspace-root=false --omit=dev

# --- Final image -----------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS runtime
ENV NODE_ENV=production \
    PORT=3000
WORKDIR /repo
# Manifests + node_modules, at the root AND in apps/api (npm may place a
# non-hoisted version there on conflict). apps/api/package.json is
# required at runtime: it carries the `imports` mapping (#/*).
COPY --from=prod-deps --chown=node:node /repo ./
COPY --from=build --chown=node:node /repo/apps/api/dist apps/api/dist
WORKDIR /repo/apps/api
USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1:3000/health || exit 1
CMD ["node", "dist/server.js"]
