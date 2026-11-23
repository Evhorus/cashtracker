import { useTranslations } from "next-intl";

import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

export const EnvelopeCardSkeleton = () => {
  return (
    <Card className="h-full border-0 bg-card/50 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-8" />
          </div>
          <Skeleton className="h-2.5 w-full rounded-full" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="space-y-1">
            <Skeleton className="ml-auto h-3 w-14" />
            <Skeleton className="ml-auto h-4 w-20" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
};

// Renders static table headers directly so only body rows are placeholders.
const EnvelopesTableSkeleton = () => {
  const t = useTranslations("envelopes.table");

  return (
    <div className="hidden overflow-x-auto rounded-2xl border border-border/60 bg-card/30 md:block">
      <table className="w-full min-w-max text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-card/60 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            <th className="px-5 py-3 text-left font-semibold">
              {t("envelope")}
            </th>
            <th className="px-5 py-3 text-left font-semibold">
              {t("category")}
            </th>
            <th className="px-5 py-3 text-left font-semibold">
              {t("progress")}
            </th>
            <th className="px-5 py-3 text-right font-semibold">{t("spent")}</th>
            <th className="px-5 py-3 text-right font-semibold">
              {t("available")}
            </th>
            <th className="px-5 py-3 text-right font-semibold">
              {t("status")}
            </th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <tr key={i}>
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </td>
              <td className="px-5 py-3.5">
                <Skeleton className="h-4 w-20" />
              </td>
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                  <Skeleton className="h-1.5 w-24 rounded-full" />
                  <Skeleton className="h-3 w-8" />
                </div>
              </td>
              <td className="px-5 py-3.5">
                <Skeleton className="ml-auto h-4 w-20" />
              </td>
              <td className="px-5 py-3.5">
                <Skeleton className="ml-auto h-4 w-20" />
              </td>
              <td className="px-5 py-3.5">
                <Skeleton className="ml-auto h-6 w-16 rounded-full" />
              </td>
              <td className="px-5 py-3.5" />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const EnvelopesListSkeleton = () => {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <EnvelopeCardSkeleton key={i} />
        ))}
      </div>
      <EnvelopesTableSkeleton />
    </>
  );
};

// Shared between envelopes/loading.tsx and the Suspense fallback in envelopes/page.tsx.
export const EnvelopesResultsSkeleton = () => {
  return (
    <>
      <Skeleton className="h-5 w-20" />
      <EnvelopesListSkeleton />
    </>
  );
};
