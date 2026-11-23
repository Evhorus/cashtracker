"use client";

import { useEffect } from "react";
import { RotateCw, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";

import { Text } from "@/shared/components/common/typography";
import { Button } from "@/shared/components/ui/button";

// Dashboard error boundary; uses retry() instead of reset() so the layout re-fetches
// categories and payment methods rather than re-throwing the same rejected promise.
export default function DashboardError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const t = useTranslations("errors");
  const tCommon = useTranslations("common");
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <TriangleAlert className="h-8 w-8 text-destructive" />
      </div>
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold">{t("genericTitle")}</h2>
        <Text className="max-w-sm">{t("genericBody")}</Text>
      </div>
      <Button onClick={() => retry()}>
        <RotateCw className="h-4 w-4" />
        {tCommon("retry")}
      </Button>
    </div>
  );
}
