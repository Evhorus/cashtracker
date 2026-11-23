/** Single source of truth for envelope spending status and its matching SQL filters. */

export const ENVELOPE_WARNING_THRESHOLD = 0.8;

export const ENVELOPE_PROGRESS_STATUSES = [
  'unlimited',
  'normal',
  'warning',
  'exceeded',
] as const;

export type EnvelopeProgressStatus =
  (typeof ENVELOPE_PROGRESS_STATUSES)[number];

/** List filter values: each status plus `all` and `alert` (warning + exceeded). */
export const ENVELOPE_STATUS_FILTERS = [
  'all',
  'normal',
  'warning',
  'alert',
  'exceeded',
  'unlimited',
] as const;

export type EnvelopeStatusFilter = (typeof ENVELOPE_STATUS_FILTERS)[number];

/** TypeORM returns `decimal` columns as strings at runtime. */
function toNumber(value: number | string): number {
  return typeof value === 'number' ? value : Number(value);
}

/** Derives spending status from limit (`null` = unlimited) and spent amount. */
export function deriveEnvelopeStatus(
  amount: number | string | null,
  spent: number | string,
): EnvelopeProgressStatus {
  if (amount === null) return 'unlimited';

  const limit = toNumber(amount);
  const used = toNumber(spent);

  // Guard against division by zero or sign flips on non-positive limits.
  if (limit <= 0) return used > 0 ? 'exceeded' : 'normal';

  // Exact integer thousandths via BigInt to match Postgres `numeric` at float boundaries (e.g. 5.6/7).
  const limitScaled = BigInt(Math.round(limit * 1000));
  const usedScaled = BigInt(Math.round(used * 1000));
  const warningPercent = BigInt(Math.round(ENVELOPE_WARNING_THRESHOLD * 100));

  if (usedScaled > limitScaled) return 'exceeded';
  if (usedScaled * 100n >= limitScaled * warningPercent) return 'warning';
  return 'normal';
}

/** SQL equivalent of `deriveEnvelopeStatus` (must stay in sync; verified by envelope-status.spec.ts). */
export function buildEnvelopeStatusPredicate(
  filter: EnvelopeStatusFilter,
  alias = 'envelope',
): { clause: string; params: Record<string, unknown> } | null {
  const amount = `${alias}.amount`;
  const spent = `${alias}.spent`;
  const params = { warningThreshold: ENVELOPE_WARNING_THRESHOLD };

  switch (filter) {
    case 'all':
      return null;

    case 'unlimited':
      return { clause: `${amount} IS NULL`, params: {} };

    case 'exceeded':
      return {
        clause:
          `${amount} IS NOT NULL AND (` +
          `(${amount} > 0 AND ${spent} > ${amount}) OR ` +
          `(${amount} <= 0 AND ${spent} > 0))`,
        params: {},
      };

    case 'normal':
      return {
        clause:
          `${amount} IS NOT NULL AND (` +
          `(${amount} > 0 AND ${spent} < ${amount} * :warningThreshold) OR ` +
          `(${amount} <= 0 AND ${spent} <= 0))`,
        params,
      };

    case 'warning':
      return {
        clause:
          `${amount} > 0 AND ${spent} >= ${amount} * :warningThreshold ` +
          `AND ${spent} <= ${amount}`,
        params,
      };

    case 'alert':
      return {
        clause:
          `${amount} IS NOT NULL AND (` +
          `(${amount} > 0 AND ${spent} >= ${amount} * :warningThreshold) OR ` +
          `(${amount} <= 0 AND ${spent} > 0))`,
        params,
      };
  }
}

export function statusMatchesFilter(
  status: EnvelopeProgressStatus,
  filter: EnvelopeStatusFilter,
): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'unlimited':
      return status === 'unlimited';
    case 'exceeded':
      return status === 'exceeded';
    case 'normal':
      return status === 'normal';
    case 'warning':
      return status === 'warning';
    case 'alert':
      return status === 'warning' || status === 'exceeded';
  }
}
