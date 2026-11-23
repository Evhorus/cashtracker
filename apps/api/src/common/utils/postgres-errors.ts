import { QueryFailedError } from 'typeorm';

/** PostgreSQL SQLSTATE for unique_violation. */
const PG_UNIQUE_VIOLATION = '23505';

/**
 * Checks whether an error thrown by TypeORM/pg is a PostgreSQL unique
 * constraint violation, so services can map concurrent duplicate inserts
 * or updates to 409 Conflict instead of an unhandled 500.
 */
export function isUniqueViolation(error: unknown): boolean {
  if (!(error instanceof QueryFailedError)) return false;
  const driverError = error.driverError as { code?: string } | undefined;
  return driverError?.code === PG_UNIQUE_VIOLATION;
}
