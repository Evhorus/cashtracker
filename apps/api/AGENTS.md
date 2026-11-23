# AGENTS.md

Guidance for AI coding agents working in this repository. Claude Code picks
it up through the `@AGENTS.md` import in `CLAUDE.md`; other agent tools read
this file directly.

## Development Commands

### General
- Build project: `pnpm run build`
- Format code: `pnpm run format` (write) / `pnpm run format:check` (verify)
- Lint code: `pnpm run lint` (with `--fix`) / `pnpm run lint:check` (verify)
- Typecheck: `pnpm run typecheck`
- Start in dev mode: `pnpm run start:dev`
- Start in debug mode: `pnpm run start:debug`
- Start in production mode: `pnpm run start:prod`

### CI and branch protection
- `.github/workflows/ci.yml` runs on every PR and push to `main`: `verify` (typecheck, lint:check, format:check, unit tests, build) and `e2e` (the e2e suites against a throwaway Postgres service container, no secrets).
- `main` is protected by the "protect main" ruleset: changes land through a PR, squash merge only, and both `verify` and `e2e` must pass. A merge to `main` deploys to Render, so this is the gate in front of production.
- Dependabot (`.github/dependabot.yml`) opens weekly PRs on Monday: one grouped PR for npm minor/patch bumps, one for GitHub Actions, and one PR per npm major. `.github/workflows/dependabot-auto-merge.yml` enables auto-merge on everything below a major, so those merge (and deploy) by themselves once `verify` and `e2e` pass; majors stay open for review. The Dockerfile's `NODE_VERSION` is not covered (Dependabot cannot resolve an ARG-built tag): bump it by hand.

### Testing
- Run all unit tests: `pnpm run test`
- Run tests in watch mode: `pnpm run test:watch`
- Run tests with coverage: `pnpm run test:cov`
- Run E2E tests: `pnpm run test:e2e` - against a throwaway Postgres on this machine only (`.env.test`, see `.env.template` > TESTS for the Docker command). `test/assert-safe-test-database.ts` aborts on any non-local host, because the suites delete every row between tests.
- Run a single test: `pnpm run test <path-to-file>`

### Database Migrations
- Generate migration: `pnpm migration generate <name>`
- Run pending migrations: `pnpm migration run`
- Revert last migration: `pnpm migration revert`
- Show migration status: `pnpm migration show`

### Database Backups
- Automated: `.github/workflows/db-backup.yml` runs daily at 08:00 UTC (and on demand) and calls `scripts/backup-db-r2.sh`: `pg_dump -F c` of production, verified with `pg_restore --list`, uploaded to the private R2 bucket `cashtracker-db-backups` under `cashtracker/` (`cashtracker-prod-YYYYMMDD-HHMMSS.dump`), remote rotation at 30 days. It retries the dump for ~5 minutes so a suspended Neon compute can wake up.
- Repo secrets: `DATABASE_URL`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`, `R2_BUCKET`, optional `HEALTHCHECK_URL`. The R2 token is scoped to that bucket only; if it expires the job fails until it is renewed.
- Extra backup on demand: run the workflow (Actions → DB backup → Run workflow). Restore: `pnpm restore "<target_url>" [dump]` (no `--` after `restore`; use Neon's direct connection, not the `-pooler` host). Steps and a row-count check are in the README ("Backups").
- Do not put production `DATABASE_URL` values in local files or logs; the scheduled job is how production data is read.

## Architecture & Structure

### High-Level Overview
The project is a REST API built with NestJS, using PostgreSQL for persistence and Clerk for authentication. It follows a modular architecture where each domain (Envelopes, Expenses, Dashboard, Auth) is encapsulated in its own module.

### Project Structure
```text
src/
├── auth/               # Clerk authentication (ClerkAuthGuard, @CurrentUser, @Public)
├── categories/         # Per-user category domain and template seeding
├── envelopes/          # Envelope domain: entities, repositories, controllers, and services
├── expenses/           # Expense domain: entities, repositories, controllers, and services
├── payment-methods/    # Per-user payment methods (card, cash, transfer)
├── dashboard/          # Read-only aggregated summary over envelopes/expenses
├── common/             # Shared constants, DTOs, guards, validators, and utility functions
├── config/             # Environment configuration and Zod validation
├── database/           # TypeORM data source and migration files
├── health-check/       # System health monitoring (/api/health-check)
├── app.module.ts       # Root application module (wires global APP_GUARD order & throttling)
└── main.ts             # Entry point
```

Each domain module (`envelopes`, `expenses`, `categories`, `payment-methods`) follows the same
internal shape, so this doesn't need to be re-documented per feature as new
ones are added:
```text
<domain>/
├── dto/                # Request DTOs (class-validator) and response DTOs
│                       # (static `fromEntity`/`fromEntities` factories)
├── entities/           # TypeORM entity
├── repositories/       # Data Mapper repository wrapping the TypeORM repo
├── <domain>.controller.ts
├── <domain>.service.ts
└── <domain>.module.ts
```
`dashboard` is read-only (no entity of its own - it queries across
envelopes and expenses) so it's a lighter version of this shape.

### Core Modules Detail
- `src/auth`: Handles authentication directly with `@clerk/backend` (`verifyToken`) via `ClerkAuthGuard` and exposes `@CurrentUser` and `@Public` decorators. `ClerkAuthGuard` is registered globally via `APP_GUARD` in `AppModule`, so every route requires auth by default - use `@Public()` to opt a route out (e.g. health check).
- `src/envelopes`: Manages envelope lifecycle. Uses a Data Mapper pattern with `EnvelopesRepository` and `Envelope` entity. Both `limit` and `spent` use `numeric(14,2)`.
- `src/expenses`: Manages expense lifecycle. Similar structure to envelopes, with `ExpensesRepository` and `Expense` entity. Nested under `/api/envelopes/:envelopeId/expenses`.
- `src/dashboard`: Aggregates envelope/expense data into summary and breakdown endpoints (`GET /api/dashboard/summary`, `category-breakdown`, `envelope-breakdown`, `name-breakdown`, `breakdown-total`, `recent-expenses`). It must read the same however a user organises envelopes (one per month, or one long-lived envelope per purpose): anything over time (monthly chart, `year`, available years, breakdowns) follows each **expense's date**, never the envelope's `createdAt`; the envelope totals (assigned, spent, available, exceeded) are the envelopes' current state and are not date-filtered. Available and exceeded are reported separately, never netted.
- `src/categories`: Per-user categories. The 9 predefined ones (`userId IS NULL`) are templates only: the first time a user loads `GET /api/categories` they are copied into that user's own rows (`CategoriesRepository.seedDefaultsFor`), so every category a user sees is theirs to rename or delete. The `category_seed` row per user is what makes the copy run exactly once (and not again after they delete them all); it is also the lock for two simultaneous first requests. Accounts that already exist are seeded once, in bulk, by the `CreateCategorySeed` migration (`seedExistingAccounts`), which also re-points their envelopes from a template to their copy - so no envelope read ever carries a template. The lazy path still re-points under a row lock for the rare envelope created against a template while the migration was rolling out. Templates are never returned or attachable to an envelope.
- `src/payment-methods`: Per-user payment methods (card, cash, transfer) with an optional statement `cutDay` for credit cards. Optional on every expense (`expense.paymentMethodId`, `ON DELETE SET NULL`): a user who never creates one sees no change. Generic on purpose - it is "what was this paid with", independent of how envelopes are organised.
- `src/database`: Centralized TypeORM configuration and migration management.
- `src/common`: Shared utilities, guards (`UserThrottlerGuard`), validators, shared DTOs (`PaginationQueryDto`, `PaginatedResponseDto`), and global constants (`ERROR_MESSAGES`).
- `src/config`: Environment variable validation using Zod.
- `src/health-check`: Provides `/api/health-check` (marked `@Public()` and `@SkipThrottle()`) for system monitoring. Also runs a production-only `@Cron` keep-alive ping to stop Render's free tier from hibernating the instance.

### Key Technical Choices
- **Framework**: NestJS 11 (Core framework for building the REST API).
- **Authentication**: Clerk (`@clerk/backend` 3) verified directly in `ClerkAuthGuard` (no Passport dependency).
- **Database ORM**: TypeORM 0.3 (Object-relational mapping and schema management via migrations).
- **Database**: PostgreSQL (via `pg` 8) (Primary persistent data store, with explicit `connectionTimeoutMillis` and `statement_timeout`).
- **Validation**: Zod 4 (Environment variable validation) and `class-validator` (DTO-level request validation).
- **Testing**: Jest 30 and Supertest 7 (Unit and end-to-end testing).
- **Scheduling**: `@nestjs/schedule` (`@Cron`) drives the production-only health-check keep-alive ping.
- **Rate Limiting**: `@nestjs/throttler` with `UserThrottlerGuard` (`src/common/guards/user-throttler.guard.ts`), registered as `APP_GUARD` in `AppModule` right after `ClerkAuthGuard`. Keys limits per endpoint on `user:${req.user.id}` (falling back to normalized IP on public routes) so users sharing the Next.js server IP do not throttle each other. Configured with burst (`20 req/s`) and sustained (`120 req/min`) tiers; skipped in `NODE_ENV === 'test'` and on `/api/health-check` (`@SkipThrottle()`).
- **Outbound HTTP**: Node's built-in `fetch` (no HTTP client dependency), used only by the health-check self-ping.
- **Security Headers**: `helmet`, applied globally in `main.ts`.

### Key Patterns
- **Data Mapper**: Repositories are used to decouple business logic from the data access layer.
- **DTOs**: Every request and response is typed using Data Transfer Objects (DTOs) with `class-validator`. Response DTOs expose static `fromEntity`/`fromEntities` factory methods rather than being constructed ad hoc in services.
- **Service-Level Ownership Validation**: Existence and ownership checks happen inside services/repositories using single queries (e.g. `findByIdAndUserId`, `findByIdForUpdate`), avoiding extra pre-check round trips from route guards.
- **Envelope `spent` integrity**: `spent` is a stored total (`numeric(14,2)`), never adjusted by increments. Every expense write (create/update/delete) runs in one transaction that first locks the envelope row (`EnvelopesRepository.findByIdForUpdate`, `SELECT ... FOR UPDATE`), re-reads the expense inside the lock, writes, and then sets `spent = SUM(expense.amount)` (`recalculateSpent`). Concurrent writes on one envelope therefore take turns, and any earlier drift is repaired on the next write.
- **One currency per envelope**: an expense must use its envelope's currency (400 otherwise), and an envelope's currency cannot change once it has expenses (409, checked under an envelope row lock). `spent` is a sum in that currency.
- **No-Enumeration Errors**: A resource that doesn't exist and one that exists but belongs to another user both resolve to the same `404 NotFoundException` (via `ERROR_MESSAGES`) - never a distinct "unauthorized" response - so IDs can't be enumerated by probing for a different status code.
- **Centralized Error Messages**: User-facing error strings live in `src/common/constants/error-messages.ts` (`ERROR_MESSAGES`) instead of being inlined at each throw site.
- **Pagination**: List endpoints compose the shared `PaginationQueryDto` (`page`/`limit`, `IntersectionType`-style extension) and return a `PaginatedResponseDto`, instead of each module reimplementing offset/limit handling.
- **Auth by Default**: `ClerkAuthGuard` is bound as the first global `APP_GUARD` in `AppModule`; routes are private unless explicitly marked `@Public()`.
- **Environment Validation**: Config is validated at startup using Zod to ensure all required variables are present.

## Development Guidelines
- **Test Alignment**: When adding new features or modifying existing ones, always review and update the corresponding unit and E2E tests to ensure they match the new implementation and requirements of the module.

