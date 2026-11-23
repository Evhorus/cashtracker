import { CURRENCY_MAP, type CurrencyCode } from "./format-currency";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ISO_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;
const YEAR_REGEX = /^\d{4}$/;

const MIN_YEAR = 2000;
const MAX_YEAR = 2100;

export function isValidUuid(value: string | undefined): value is string {
  return typeof value === "string" && UUID_REGEX.test(value);
}

/** Validates an ISO date (YYYY-MM-DD) and verifies the calendar date exists (e.g. rejects 2026-02-31). */
export function parseIsoDateParam(
  value: string | undefined,
): string | undefined {
  if (!value) return undefined;
  const match = ISO_DATE_REGEX.exec(value);
  if (!match) return undefined;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return undefined;
  }

  return value;
}

/** Validates a 4-digit year within the backend's 2000..2100 range. */
export function parseYearParam(value: string | undefined): number | undefined {
  if (!value || !YEAR_REGEX.test(value)) return undefined;
  const year = Number(value);
  return year >= MIN_YEAR && year <= MAX_YEAR ? year : undefined;
}

export function parseCurrencyParam(
  value: string | undefined,
): CurrencyCode | undefined {
  if (!value) return undefined;
  return Object.prototype.hasOwnProperty.call(CURRENCY_MAP, value)
    ? (value as CurrencyCode)
    : undefined;
}

/** Drops invalid tokens from a comma-separated UUID/sentinel list so hand-edited URLs don't 400. */
export function sanitizeUuidListParam(
  value: string | undefined,
  allowedSentinels: readonly string[] = [],
): string | undefined {
  if (!value) return undefined;
  const valid = value
    .split(",")
    .filter((token) => allowedSentinels.includes(token) || isValidUuid(token));
  return valid.length > 0 ? valid.join(",") : undefined;
}
