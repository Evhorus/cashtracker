import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getLocale, getTranslations } from "next-intl/server";

import { PageHeader } from "@/features/dashboard/components/page-header";
import { getEnvelopeById } from "@/features/envelopes/data/get-envelope-by-id";
import { EnvelopeHelpers } from "@/features/envelopes/lib/envelope-helpers";
import { DeleteExpenseAlertDialog } from "@/features/expenses/components/delete-expense-alert-dialog";
import { ExpenseActionsMenu } from "@/features/expenses/components/expense-actions-menu";
import {
  ExpenseHighlightCard,
  ExpenseImpactCard,
  ExpenseSystemInfoCard,
} from "@/features/expenses/components/expense-detail-cards";
import { UpdateExpenseDialog } from "@/features/expenses/components/update-expense-dialog";
import { getExpenseById } from "@/features/expenses/data/get-expense-by-id";
import type { SupportedLocale } from "@/shared/config/i18n/config";

export async function generateMetadata({
  params,
}: Pick<ExpensePageProps, "params">): Promise<Metadata> {
  const { envelopeId, expenseId } = await params;
  const expense = await getExpenseById(envelopeId, expenseId);
  return { title: expense.name };
}

interface ExpensePageProps {
  params: Promise<{ envelopeId: string; expenseId: string }>;
}

export default async function ExpensePage({ params }: ExpensePageProps) {
  await auth.protect();
  const locale = (await getLocale()) as SupportedLocale;
  const tCommon = await getTranslations("common");
  const t = await getTranslations("expenses");
  const { envelopeId, expenseId } = await params;

  const [expense, envelope] = await Promise.all([
    getExpenseById(envelopeId, expenseId),
    getEnvelopeById(envelopeId),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-10">
      <PageHeader
        title={t("detail.title")}
        backUrl={`/dashboard/envelope/${envelopeId}`}
        breadcrumbParents={[
          { href: `/dashboard/envelope/${envelopeId}`, label: envelope.name },
        ]}
        description={
          <>
            <span className="text-sm">{t("detail.inEnvelope")}</span>
            <Link
              href={`/dashboard/envelope/${envelopeId}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              {envelope.name}
            </Link>
            <span className="text-sm text-muted-foreground">
              · {EnvelopeHelpers.formatPeriod(envelope, locale)}
            </span>
          </>
        }
        actions={
          <>
            <UpdateExpenseDialog
              envelopeId={envelopeId}
              currency={envelope.currency}
              expense={expense}
              label={tCommon("edit")}
              showLabelOnDesktop
            />
            <DeleteExpenseAlertDialog
              envelopeId={envelopeId}
              expenseId={expenseId}
              label={tCommon("delete")}
              showLabelOnDesktop
            />
          </>
        }
        mobileActions={
          <ExpenseActionsMenu
            envelopeId={envelopeId}
            currency={envelope.currency}
            expense={expense}
          />
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ExpenseHighlightCard
            expense={expense}
            currency={envelope.currency}
            locale={locale}
          />
          <ExpenseSystemInfoCard expense={expense} locale={locale} />
        </div>

        <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <ExpenseImpactCard expense={expense} envelope={envelope} />
        </div>
      </div>
    </div>
  );
}
