import { Suspense } from "react";
import { DollarSign } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

import {
  CategoryIcon,
  CategoryLabel,
} from "@/features/categories/components/category-badge";
import { PageHeader } from "@/features/dashboard/components/page-header";
import { DeleteEnvelopeAlertDialog } from "@/features/envelopes/components/delete-envelope-alert-dialog";
import { EnvelopeActionsMenu } from "@/features/envelopes/components/envelope-actions-menu";
import { EnvelopeSummaryCard } from "@/features/envelopes/components/envelope-summary-card";
import { UpdateEnvelopeDialog } from "@/features/envelopes/components/update-envelope-dialog";
import { getEnvelopeById } from "@/features/envelopes/data/get-envelope-by-id";
import { EnvelopeHelpers } from "@/features/envelopes/lib/envelope-helpers";
import type { EditableEnvelope } from "@/features/envelopes/types";
import { CreateExpenseDialog } from "@/features/expenses/components/create-expense-dialog";
import { EnvelopeExpensesResults } from "@/features/expenses/components/envelope-expenses-results";
import { ExpensesFilter } from "@/features/expenses/components/expenses-filter";
import { ExpensesListSkeleton } from "@/features/expenses/components/expenses-list-skeleton";
import {
  EXPENSES_DEFAULT_PAGE_SIZE,
  EXPENSES_PAGE_SIZE_OPTIONS,
} from "@/features/expenses/lib/expense-helpers";
import {
  expenseOrderParams,
  parseExpenseOrder,
} from "@/features/expenses/lib/expense-order";
import {
  methodOptionsFor,
  UNASSIGNED_METHOD,
} from "@/features/payment-methods/lib/method-filter";
import { Heading } from "@/shared/components/common/typography";
import {
  parseIsoDateParam,
  sanitizeUuidListParam,
} from "@/shared/utils/url-params";

export interface EnvelopeDetailSearchParams {
  startDate?: string;
  endDate?: string;
  search?: string;
  sort?: string;
  sortBy?: string;
  methods?: string;
  page?: string;
  limit?: string;
}

interface EnvelopeDetailViewProps {
  envelopeId: string;
  searchParams: EnvelopeDetailSearchParams;
}

export async function EnvelopeDetailView({
  envelopeId,
  searchParams,
}: EnvelopeDetailViewProps) {
  const locale = await getLocale();
  const t = await getTranslations("common");
  const tEnvelope = await getTranslations("envelopes");
  const {
    startDate: rawStartDate,
    endDate: rawEndDate,
    search,
    sort,
    sortBy,
    methods: rawMethods,
    page: pageParam,
    limit: limitParam,
  } = searchParams;

  const startDate = parseIsoDateParam(rawStartDate);
  const endDate = parseIsoDateParam(rawEndDate);
  const methods = sanitizeUuidListParam(rawMethods, [UNASSIGNED_METHOD]);
  const page = pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1;
  const order = expenseOrderParams(parseExpenseOrder(sort, sortBy));
  const limit = EXPENSES_PAGE_SIZE_OPTIONS.some(
    (option) => String(option) === limitParam,
  )
    ? Number(limitParam)
    : EXPENSES_DEFAULT_PAGE_SIZE;

  const envelope = await getEnvelopeById(envelopeId);
  const hasActiveFilter = Boolean(search || startDate || endDate || methods);
  const methodOptions = methodOptionsFor(envelope.expenses);
  const editableEnvelope: EditableEnvelope = {
    id: envelope.id,
    name: envelope.name,
    amount: envelope.amount,
    currency: envelope.currency,
    spent: envelope.spent,
    category: envelope.category,
  };
  const filterQuery = {
    envelopeId,
    startDate,
    endDate,
    search,
    methods,
    order,
    page,
    limit,
  };
  const filterKey = `${page}-${limit}-${search ?? ""}-${order.sortBy}-${order.sort}-${startDate ?? ""}-${endDate ?? ""}-${methods ?? ""}`;

  return (
    <div className="space-y-8">
      <PageHeader
        title={envelope.name}
        backUrl="/dashboard/envelopes"
        icon={
          <CategoryIcon
            category={envelope.category}
            className="h-11 w-11 rounded-xl"
          />
        }
        description={
          <p className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
            {EnvelopeHelpers.formatPeriod(envelope, locale)}
            {envelope.category && (
              <>
                <span aria-hidden="true">·</span>
                <CategoryLabel category={envelope.category} />
              </>
            )}
            <span aria-hidden="true">·</span>
            <span className="rounded-sm bg-secondary px-1 py-0.5 font-mono text-xs text-secondary-foreground">
              {envelope.currency}
            </span>
          </p>
        }
        actions={
          <>
            <UpdateEnvelopeDialog
              envelope={editableEnvelope}
              label={t("edit")}
              showLabelOnDesktop
            />
            <DeleteEnvelopeAlertDialog
              id={envelopeId}
              name={envelope.name}
              label={t("delete")}
              showLabelOnDesktop
            />
          </>
        }
        mobileActions={<EnvelopeActionsMenu envelope={editableEnvelope} />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="order-2 space-y-6 lg:order-1 lg:col-span-2">
          <div className="flex flex-row items-center justify-between">
            <Heading icon={DollarSign}>{tEnvelope("detail.history")}</Heading>
            <CreateExpenseDialog
              envelopeId={envelope.id}
              currency={envelope.currency}
              envelopeName={envelope.name}
              envelopePeriod={EnvelopeHelpers.formatPeriod(envelope, locale)}
              envelopeCategory={envelope.category}
            />
          </div>

          <ExpensesFilter methodOptions={methodOptions} />
          <Suspense key={filterKey} fallback={<ExpensesListSkeleton />}>
            <EnvelopeExpensesResults
              {...filterQuery}
              currency={envelope.currency}
              filterBanner={
                hasActiveFilter
                  ? {
                      envelopeExpenseCount: envelope.expenses.length,
                      methodOptions,
                    }
                  : undefined
              }
            />
          </Suspense>
        </div>

        <div className="order-1 lg:sticky lg:top-20 lg:order-2 lg:self-start">
          <EnvelopeSummaryCard
            envelope={envelope}
            hasActiveFilter={hasActiveFilter}
            filterKey={filterKey}
            filterQuery={filterQuery}
            methodOptions={methodOptions}
          />
        </div>
      </div>
    </div>
  );
}
