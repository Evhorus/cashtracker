export class DashboardEnvelopeBreakdownDto {
  envelopeId: string;
  envelopeName: string;
  spent: number;
  expenseCount: number;
  /** `YYYY-MM-DD` date span of matching expenses, used to distinguish envelopes with the same name. */
  firstExpenseDate: string;
  lastExpenseDate: string;
}
