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

## Import Conventions

All enforced by ESLint in both apps (`eslint-plugin-import`), so they are the rule, not a habit:

- **Paths:** `./x` only for files in the same folder; anything that climbs a folder uses the `@/` alias (`@/*` → `src/*`); `@cashtracker/shared` for the shared package. `../` (and `src/` in the API) fail `no-restricted-imports`, because they would bypass the web's `@/`-based boundary rules and break when files move. `@/` works at runtime because `nest build` rewrites it in `dist/`, Vitest resolves it (`resolve.tsconfigPaths`), and the TypeORM CLI runs with `tsconfig-paths/register`.
- **Order (`import/order`, autofixable with `eslint --fix`):** packages first (builtins, npm and `@cashtracker/shared`), one blank line, then `@/` and relative imports. Side-effect imports such as CSS are left where they are.
- **No cycles (`import/no-cycle`, type-only imports ignored), with no exceptions:** a runtime cycle can hand a module `undefined` while it is still loading. A bidirectional TypeORM relation names the other side by entity name and imports it as a type (`@ManyToOne('Envelope', (envelope: Envelope) => envelope.expenses)` with `import type { Envelope }`), which is how `Envelope` ↔ `Expense` avoids a cycle. A wrong name fails at boot (`Entity metadata for Expense#envelope was not found`), so `e2e-api` catches it. One-way relations keep the class (`() => PaymentMethod`) for compile-time safety.
- **Type imports (web, `@typescript-eslint/consistent-type-imports`, autofixable):** anything used only as a type is imported with `import type`, so a reader can tell what exists at runtime. Not enabled in the API: with `experimentalDecorators` + `emitDecoratorMetadata` the rule skips every file that has decorators, because Nest DI needs the real classes.

## Production & Safety Rules

- **Deploy ordering for API contract changes:** Merging to `main` triggers Vercel (~45 s) and Render (~2–3 min) simultaneously. Breaking API contract changes (new query/body fields rejected by `ValidationPipe`, or removed/changed response fields rejected by frontend Zod schemas) must still land in two PRs — backend merged and confirmed live on Render first, then frontend — or use expand/contract.
- **Never point local `apps/api/.env` at production Neon:** Local dev and tests run against a throwaway local Docker Postgres (`127.0.0.1:55432`, DBs `cashtracker_dev` and `cashtracker_test`). `apps/api/test/assert-safe-test-database.ts` aborts e2e runs against any non-local host.
- **Branch protection & CI:** `main` is protected by the `"protect main"` ruleset (PR only, squash merge, up-to-date branch required, required checks `verify`, `e2e-api`, `e2e-web`).
- **Commits:** Conventional Commits enforced by `.husky/commit-msg` (`commitlint` with stock `config-conventional`). `.husky/pre-commit` runs `pnpm check`.
- **Dependabot & Backups:** `.github/dependabot.yml` updates the pnpm workspace weekly from `/` and `.github/workflows/dependabot-auto-merge.yml` auto-merges minor/patch PRs once required checks pass. `.github/workflows/db-backup.yml` runs daily backups to R2 via `apps/api/scripts/backup-db-r2.sh`.
