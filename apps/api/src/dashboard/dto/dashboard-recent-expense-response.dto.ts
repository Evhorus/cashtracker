export class DashboardRecentExpenseDto {
  id: string;
  name: string;
  amount: number;
  currency: string;
  /** Plain calendar date (`YYYY-MM-DD`). */
  date: string;
  envelopeId: string;
  envelopeName: string;
}
