import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";

import { ExpenseDetailView } from "@/features/expenses/components/expense-detail-view";
import { getExpenseById } from "@/features/expenses/data/get-expense-by-id";

interface ExpensePageProps {
  params: Promise<{ envelopeId: string; expenseId: string }>;
}

export async function generateMetadata({
  params,
}: Pick<ExpensePageProps, "params">): Promise<Metadata> {
  const { envelopeId, expenseId } = await params;
  const expense = await getExpenseById(envelopeId, expenseId);
  return { title: expense.name };
}

export default async function ExpensePage({ params }: ExpensePageProps) {
  await auth.protect();
  const { envelopeId, expenseId } = await params;

  return <ExpenseDetailView envelopeId={envelopeId} expenseId={expenseId} />;
}
