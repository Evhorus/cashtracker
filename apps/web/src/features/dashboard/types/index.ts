import type { CurrencyCode } from "@/shared/utils/format-currency";

/** Cross-envelope expense row for the dashboard recent-activity widget (includes parent envelope name). */
export interface DashboardRecentExpense {
  id: string;
  name: string;
  amount: number;
  currency: CurrencyCode;
  date: Date;
  envelopeId: string;
  envelopeName: string;
}
