import { useTranslations } from "next-intl";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

export const MonthlySpendingChartSkeleton = () => {
  const t = useTranslations("statistics");
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("chartTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full sm:h-80" />
      </CardContent>
    </Card>
  );
};
