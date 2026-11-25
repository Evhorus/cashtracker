"use client";

import { useEffect } from "react";
import { RotateCw, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";

import { Text } from "@/shared/components/common/typography";
import { Button } from "@/shared/components/ui/button";

/** Root error boundary for routes outside /dashboard; uses retry() to re-run failed server fetches. */
export default function RootError({
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
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 py-24 text-center">
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
