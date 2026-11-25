import { Suspense } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { TriangleAlert, Wallet } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { AlertEnvelopes } from "@/features/dashboard/components/alert-envelopes";
import { DashboardSummarySkeleton } from "@/features/dashboard/components/dashboard-summary-skeleton";
import { HeroBalanceCard } from "@/features/dashboard/components/hero-balance-card";
import { RecentActivity } from "@/features/dashboard/components/recent-activity";
import { SummaryTile } from "@/features/dashboard/components/summary-tile";
import { getAlertEnvelopes } from "@/features/dashboard/lib/dashboard-summary";
import { DashboardService } from "@/features/dashboard/services/dashboard.service";
import { CreateEnvelopeDialog } from "@/features/envelopes/components/create-envelope-dialog";
import { EnvelopesService } from "@/features/envelopes/services/envelopes.service";
import { EmptyState } from "@/shared/components/common/empty-state";
import { LocalDate } from "@/shared/components/common/local-date";
import { Heading } from "@/shared/components/common/typography";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import type { CurrencyCode } from "@/shared/utils/format-currency";

const ALERT_ENVELOPES_LIMIT = 100;

export function DashboardOverviewView() {
  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs font-medium tracking-wider text-muted-foreground uppercase">
          <LocalDate />
        </p>
        <Suspense fallback={<Skeleton className="mt-0.5 h-9 w-56" />}>
          <Greeting />
        </Suspense>
      </div>

      <Suspense fallback={<DashboardSummarySkeleton />}>
        <DashboardSummarySection />
      </Suspense>
    </div>
  );
}

async function Greeting() {
  const [user, t] = await Promise.all([
    currentUser(),
    getTranslations("dashboard"),
  ]);

  return (
    <Heading as="h1" size="lg" className="mt-0.5">
      {user?.firstName ? t("greeting", { name: user.firstName }) : t("title")}
    </Heading>
  );
}

async function DashboardSummarySection() {
  const t = await getTranslations("dashboard");
  const [summary, envelopesResult, recentExpenses] = await Promise.all([
    DashboardService.getSummary(),
    EnvelopesService.getAll({ status: "alert", limit: ALERT_ENVELOPES_LIMIT }),
    DashboardService.getRecentExpenses(5),
  ]);

  if (summary.totalEnvelopes === 0) {
    return <DashboardEmptyState />;
  }

  const totals = summary.totals.map((total) => ({
    ...total,
    currency: total.currency as CurrencyCode,
  }));
  const alertEnvelopes = getAlertEnvelopes(envelopesResult.data);
  const alertCount = envelopesResult.meta.total;

  const tiles = (
    <>
      <SummaryTile
        icon={Wallet}
        label={t("totalEnvelopes")}
        value={summary.totalEnvelopes}
        href="/dashboard/envelopes"
      />
      <SummaryTile
        icon={TriangleAlert}
        label={t("onAlert")}
        value={alertCount}
        tone={alertCount > 0 ? "alert" : "muted"}
        href="/dashboard/envelopes?status=alert"
      />
    </>
  );

  const heroCards = totals.map((total) => (
    <HeroBalanceCard
      key={total.currency}
      currency={total.currency}
      totalAssigned={total.totalAssigned}
      totalSpent={total.totalSpent}
      totalSpentCapped={total.totalSpentCapped}
      totalAvailable={total.totalAvailable}
      totalExceeded={total.totalExceeded}
      className="w-full md:w-[calc(50%-0.5rem)]"
    />
  ));

  return (
    <>
      {totals.length === 1 ? (
        <div className="flex flex-wrap items-start gap-4">
          {heroCards}
          <div className="flex w-full flex-col gap-4 md:w-[calc(50%-0.5rem)]">
            {tiles}
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-4">{heroCards}</div>
          <div className="grid grid-cols-2 gap-4">{tiles}</div>
        </>
      )}

      {(alertEnvelopes.length > 0 || recentExpenses.length > 0) && (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          {alertEnvelopes.length > 0 && (
            <AlertEnvelopes
              entries={alertEnvelopes}
              className={cn(recentExpenses.length === 0 && "lg:col-span-2")}
            />
          )}

          {recentExpenses.length > 0 && (
            <RecentActivity
              expenses={recentExpenses}
              className={cn(alertEnvelopes.length === 0 && "lg:col-span-2")}
            />
          )}
        </div>
      )}
    </>
  );
}

async function DashboardEmptyState() {
  const t = await getTranslations("dashboard");

  return (
    <EmptyState
      variant="first-run"
      icon={Wallet}
      eyebrow={t("emptyEyebrow")}
      title={t("emptyTitle")}
      description={t("emptyBody")}
      action={<CreateEnvelopeDialog />}
    />
  );
}
