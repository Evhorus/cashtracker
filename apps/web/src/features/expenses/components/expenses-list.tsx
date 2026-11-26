"use client";
import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Receipt, SearchX } from "lucide-react";
import { useTranslations } from "next-intl";

import type { Expense } from "@/features/expenses/types";
import { EmptyState } from "@/shared/components/common/empty-state";
import type { CurrencyCode } from "@/shared/utils/format-currency";
import { DeleteExpenseAlertDialog } from "./delete-expense-alert-dialog";
import { ExpenseCard } from "./expense-card";
import { ExpensesTable } from "./expenses-table";
import { UpdateExpenseDialog } from "./update-expense-dialog";

interface ExpensesGridProps {
  expenses: Expense[];
  currency: CurrencyCode;
}

/** Filter-aware empty state; reads active URL search/date params directly instead of prop drilling. */
function ExpensesEmptyState() {
  const t = useTranslations("expenses.empty");
  const searchParams = useSearchParams();
  const search = searchParams.get("search");
  const hasDateFilter =
    searchParams.has("startDate") || searchParams.has("endDate");
  const hasMethodFilter = Boolean(searchParams.get("methods"));

  if (search) {
    return (
      <EmptyState
        icon={SearchX}
        title={t("noResultsTitle", { query: search })}
        description={t("noResultsBody")}
      />
    );
  }

  if (hasDateFilter && !hasMethodFilter) {
    return (
      <EmptyState
        icon={SearchX}
        title={t("noDateRangeTitle")}
        description={t("noDateRangeBody")}
      />
    );
  }

  if (hasMethodFilter) {
    return (
      <EmptyState
        icon={SearchX}
        title={t("noFilterResultsTitle")}
        description={t("noFilterResultsBody")}
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
