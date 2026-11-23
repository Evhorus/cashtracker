export class DashboardChartEntryDto {
  /** Calendar month key in `"YYYY-MM"` format (clients handle localized formatting). */
  month: string;
  spent: number;
}

export class DashboardCurrencyTotalsDto {
  currency: string;
  totalEnvelopes: number;
  /** Sum of limits across capped envelopes (`amount !== null`). */
  totalAssigned: number;
  /** Sum of spent across all envelopes (including unlimited). */
  totalSpent: number;
  /** Sum of spent across capped envelopes only (comparable against `totalAssigned`). */
  totalSpentCapped: number;
  /** Sum of `max(amount - spent, 0)` across capped envelopes. */
  totalAvailable: number;
  /** Sum of `max(spent - amount, 0)` across capped envelopes (kept separate from `totalAvailable`). */
  totalExceeded: number;
}

export class DashboardSummaryResponseDto {
  totalEnvelopes: number;
  totals: DashboardCurrencyTotalsDto[];
  chart: DashboardChartEntryDto[];
  /** Resolved currency for `chart` (falls back to primary currency; `null` when user has no envelopes). */
  chartCurrency: string | null;
  /** Distinct years with expenses, descending. */
  availableYears: number[];
}
