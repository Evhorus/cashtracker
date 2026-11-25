# AGENTS.md

Guidance for AI coding agents working in the CashTracker monorepo. Claude Code picks this up via `CLAUDE.md`; other agent tools read this file directly.

## Repository Layout

Turborepo + pnpm (`pnpm@11.20.0`) monorepo:

- `apps/web` (`@cashtracker/web`) — Next.js 16 frontend deployed on Vercel (Root Directory `apps/web`). See [apps/web/AGENTS.md](apps/web/AGENTS.md).
- `apps/api` (`@cashtracker/api`) — NestJS 11 + TypeORM + PostgreSQL REST API deployed on Render via Docker (Root Directory `.`, Dockerfile `apps/api/Dockerfile`). See [apps/api/AGENTS.md](apps/api/AGENTS.md).
- `packages/shared` (`@cashtracker/shared`) — Shared Zod 4 API response schemas, domain constants (`CURRENCY_CODES`, `MAX_AMOUNT`, `MAX_PAGE_SIZE`, `ICON_KEYS`, `PRESET_COLORS`, `PAYMENT_METHOD_TYPES`, envelope/expense statuses and sorts), and inferred TypeScript types consumed by both `@cashtracker/api` and `@cashtracker/web`. Built as dual ESM/CJS (`dist/esm`, `dist/cjs`).

## Common Commands (Run From Repo Root)

- Full gate: `pnpm check` (`turbo run typecheck lint format:check test knip`)
- Build all: `pnpm build`
- Individual gates: `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm format`, `pnpm test`, `pnpm knip`
- Dev servers: `pnpm dev:web` (`:3000`), `pnpm dev:api` (`:4000`), or `pnpm dev`
- Backend e2e (local Docker Postgres only): `pnpm test:e2e:api`
- Frontend e2e: `pnpm test:e2e:web` (signed-out), `pnpm test:e2e:web:signed-in` (requires local backend + test user)
- Database migrations: `pnpm migration <generate|run|revert|show>`

## Production & Safety Rules

- **Deploy ordering for API contract changes:** Merging to `main` triggers Vercel (~45 s) and Render (~2–3 min) simultaneously. Breaking API contract changes (new query/body fields rejected by `ValidationPipe`, or removed/changed response fields rejected by frontend Zod schemas) must still land in two PRs — backend merged and confirmed live on Render first, then frontend — or use expand/contract.
- **Never point local `apps/api/.env` at production Neon:** Local dev and tests run against a throwaway local Docker Postgres (`127.0.0.1:55432`, DBs `cashtracker_dev` and `cashtracker_test`). `apps/api/test/assert-safe-test-database.ts` aborts e2e runs against any non-local host.
- **Branch protection & CI:** `main` is protected by the `"protect main"` ruleset (PR only, squash merge, up-to-date branch required, required checks `verify`, `e2e-api`, `e2e-web`).
- **Commits:** Conventional Commits enforced by `.husky/commit-msg` (`commitlint` with stock `config-conventional`). `.husky/pre-commit` runs `pnpm check`.
- **Dependabot & Backups:** `.github/dependabot.yml` updates the pnpm workspace weekly from `/` and `.github/workflows/dependabot-auto-merge.yml` auto-merges minor/patch PRs once required checks pass. `.github/workflows/db-backup.yml` runs daily backups to R2 via `apps/api/scripts/backup-db-r2.sh`.
