# CashTracker

Personal envelope-budgeting application built as a **Turborepo + pnpm** monorepo.

## Workspaces

| Workspace | Package | Stack | Hosting | Docs |
| --- | --- | --- | --- | --- |
| `apps/web` | `@cashtracker/web` | Next.js 16, React 19, Tailwind CSS 4, Base UI (shadcn), Clerk, next-intl, Zod 4 | Vercel | [apps/web/README.md](apps/web/README.md) |
| `apps/api` | `@cashtracker/api` | NestJS 11, TypeORM 1.1, PostgreSQL (Neon), Clerk, Zod 4 | Render (Docker) | [apps/api/README.md](apps/api/README.md) |
| `packages/shared` | `@cashtracker/shared` | Shared Zod 4 API schemas, constants & types (dual ESM/CJS) | Workspace lib | — |

## Quick Start

**Requirements:** Node.js `24.x` (see `.nvmrc`), `pnpm` `11.20.0`, Docker (for local PostgreSQL).

```bash
pnpm install
```

Copy the environment templates and configure local values (never point local `apps/api/.env` at production):

```bash
cp apps/api/.env.template apps/api/.env
cp apps/web/.env.template apps/web/.env
```

Start a throwaway local PostgreSQL container:

```bash
docker run -d --rm --name cashtracker-pg -p 127.0.0.1:55432:5432 \
  -e POSTGRES_HOST_AUTH_METHOD=trust postgres:17-alpine
docker exec cashtracker-pg createdb -U postgres cashtracker_dev
docker exec cashtracker-pg createdb -U postgres cashtracker_test
```

Run apps locally:

```bash
pnpm dev:api   # http://localhost:4000/api
pnpm dev:web   # http://localhost:3000
```

## Scripts

| Command | Description |
| --- | --- |
| `pnpm check` | Typecheck, lint, format check, unit tests, and Knip across workspaces |
| `pnpm build` | Production build for all apps via Turborepo |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm test:e2e:api` | Backend e2e tests against local throwaway PostgreSQL |
| `pnpm test:e2e:web` | Frontend signed-out Playwright suite |
| `pnpm test:e2e:web:signed-in` | Frontend signed-in Playwright suite (needs running local API) |
| `pnpm migration <cmd>` | TypeORM migration CLI (`generate`, `run`, `revert`, `show`) |
