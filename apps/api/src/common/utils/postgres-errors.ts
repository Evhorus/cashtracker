import { QueryFailedError } from 'typeorm';

const PG_UNIQUE_VIOLATION = '23505';

/** True when a TypeORM/pg error is PostgreSQL `unique_violation` (23505), for mapping to 409 Conflict. */
export function isUniqueViolation(error: unknown): boolean {
  if (!(error instanceof QueryFailedError)) return false;
  const driverError = error.driverError as { code?: string } | undefined;
  return driverError?.code === PG_UNIQUE_VIOLATION;
}
