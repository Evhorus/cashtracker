"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Expense } from "@/features/expenses/types";
import { useParams, useSearchParams } from "next/navigation";
import { Receipt, SearchX } from "lucide-react";
import { EmptyState } from "@/shared/components/common/empty-state";
import { ExpenseCard } from "./expense-card";
import { ExpensesTable } from "./expenses-table";
import { UpdateExpenseDialog } from "./update-expense-dialog";
import { DeleteExpenseAlertDialog } from "./delete-expense-alert-dialog";
import type { CurrencyCode } from "@/shared/utils/format-currency";

interface ExpensesGridProps {
  expenses: Expense[];
  currency: CurrencyCode;
}

/**
 * Empty state for this list. Filter-aware, the same distinction
 * EnvelopesGrid already made and this list didn't: "no results for this
 * search" must not read as "you have no expenses at all".
 *
 * Reads the URL directly rather than taking props - this component is
 * already a Client Component sitting under the same search/date filters
 * the server used to build the list, so there's nothing to thread down.
 */
function ExpensesEmptyState() {
  const t = useTranslations("expenses.empty");
  const searchParams = useSearchParams();
  const search = searchParams.get("search");
  const hasDateFilter =
    searchParams.has("startDate") || searchParams.has("endDate");

  if (search) {
    return (
      <EmptyState
        icon={SearchX}
        title={t("noResultsTitle", { query: search })}
        description={t("noResultsBody")}
      />
    );
  }

  if (hasDateFilter) {
    return (
      <EmptyState
        icon={SearchX}
        title={t("noDateRangeTitle")}
        description={t("noDateRangeBody")}
      />
    );
  }

  return (
    <EmptyState
      variant="first-run"
      icon={Receipt}
      title={t("firstRunTitle")}
      description={t("firstRunBody")}
    />
  );
}

export const ExpensesList = ({ expenses, currency }: ExpensesGridProps) => {
  const { envelopeId } = useParams<{ envelopeId: string }>();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(
    null,
  );
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setEditOpen(true);
  };

  const handleDelete = (expense: Expense) => {
    setDeletingExpenseId(expense.id);
    setDeleteOpen(true);
  };

  return (
    <>
      {expenses.length === 0 ? (
        <ExpensesEmptyState />
      ) : (
        <>
          {/* Mobile: the compact card list. Desktop: a dense table
              instead of the same cards stretched wider - see
              expenses-table.tsx, same split EnvelopesGrid already uses. */}
          <div className="space-y-2 md:hidden">
            {expenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                envelopeId={envelopeId}
                currency={currency}
                onEdit={() => handleEdit(expense)}
                onDelete={() => handleDelete(expense)}
              />
            ))}
          </div>
          <ExpensesTable
            expenses={expenses}
            envelopeId={envelopeId}
            currency={currency}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </>
      )}

      {editingExpense && (
        <UpdateExpenseDialog
          envelopeId={envelopeId}
          currency={currency}
          expense={editingExpense}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}
      {deletingExpenseId && (
        <DeleteExpenseAlertDialog
          envelopeId={envelopeId}
          expenseId={deletingExpenseId}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
        />
      )}
    </>
  );
};
