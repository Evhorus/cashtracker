import { Expense } from "@/features/expenses/types";
import type { CurrencyCode } from "@/shared/utils/format-currency";
import type { PaginationMeta } from "@/shared/utils/pagination";
import type { EnvelopeProgressStatus } from "../lib/envelope-helpers";

export interface EnvelopesResponse {
  data: Envelope[];
  meta: PaginationMeta;
}

export interface EnvelopeCategory {
  id: string;
  label: string;
  color: string;
  icon: string;
}

export interface Envelope {
  id: string;
  name: string;
  /** Spending limit, or `null` for an unlimited running counter. */
  amount: string | null;
  /** Fixed at creation; all expenses in this envelope inherit this currency. */
  currency: CurrencyCode;
  spent: string;
  /** Backend-computed status (warning thresholds live in cashtracker-backend). */
  status: EnvelopeProgressStatus;
  /** Embedded by the API, or `null` when unclassified. */
  category: EnvelopeCategory | null;
  description?: string;
  expenses: Expense[];
  /** UTC-anchored span of this envelope's expense dates, or `null` when empty. */
  expenseDateRange: { first: Date; last: Date } | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Narrow projection passed to client edit dialogs and action menus so detail
 * pages do not serialize the full `expenses[]` array to the client. */
export type EditableEnvelope = Pick<
  Envelope,
  "id" | "name" | "amount" | "currency" | "spent" | "category"
>;
