# syntax=docker/dockerfile:1.7

# ---------------------------------------------------------------------------
# CashTracker API — production monorepo image
#
# Multi-stage build using `turbo prune @cashtracker/api --docker` so changes
# to unrelated apps never invalidate API layers, and the final runtime image
# contains only compiled `dist/` plus production dependencies.
# ---------------------------------------------------------------------------

ARG NODE_VERSION=22.23.2
ARG PNPM_VERSION=11.20.0
ARG TURBO_VERSION=2.11.13

# ---- base ------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS base
ARG PNPM_VERSION
ENV PNPM_HOME="/pnpm" \
    PATH="/pnpm/bin:/pnpm:${PATH}"
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
WORKDIR /app

# ---- pruner: isolate @cashtracker/api and its workspace deps only ----------
FROM base AS pruner
ARG TURBO_VERSION
RUN pnpm add -g turbo@${TURBO_VERSION}
COPY . .
RUN turbo prune @cashtracker/api --docker

# ---- build: install pruned graph, compile, and deploy prod bundle ----------
FROM base AS build
COPY --from=pruner /app/out/json/ ./
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN --mount=type=cache,id=cashtracker-pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ ./
RUN pnpm turbo run build --filter=@cashtracker/api...
RUN pnpm --filter @cashtracker/api --prod --legacy deploy /prod/api

# ---- runtime: minimal final image ------------------------------------------
FROM node:${NODE_VERSION}-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# tini handles PID 1 signal forwarding/reaping; strip bundled npm/corepack CLIs
# to eliminate their vendored CVE surface at runtime.
RUN apk add --no-cache tini \
    && addgroup -S nodeapp \
    && adduser -S nodeapp -G nodeapp \
    && rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
              /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack

COPY --from=build --chown=nodeapp:nodeapp /prod/api/package.json ./
COPY --from=build --chown=nodeapp:nodeapp /prod/api/node_modules ./node_modules
COPY --from=build --chown=nodeapp:nodeapp /app/apps/api/dist ./dist

USER nodeapp
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get({host:'127.0.0.1',port:process.env.PORT||4000,path:'/api/health-check',timeout:4000},r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main.js"]
