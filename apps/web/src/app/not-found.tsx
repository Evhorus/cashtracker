import Link from "next/link";
import { Compass } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Text } from "@/shared/components/common/typography";
import { Button } from "@/shared/components/ui/button";

// Renders a real 404 page instead of redirecting so status codes stay accurate.
export default async function NotFound() {
  const t = await getTranslations("errors");
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-5 px-4 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Compass className="h-8 w-8 text-primary" />
      </div>
      <div className="space-y-2">
        <p className="font-mono text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          {t("notFoundCode")}
        </p>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {t("notFoundTitle")}
        </h1>
        <Text className="mx-auto max-w-sm">{t("notFoundBody")}</Text>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        {/* Base UI convention for a Link styled as a Button (see back-link-button.tsx). */}
        <Button render={<Link href="/dashboard" />} nativeButton={false}>
          {t("goToSummary")}
        </Button>
        <Button
          variant="outline"
          render={<Link href="/" />}
          nativeButton={false}
        >
          {t("goHome")}
        </Button>
      </div>
    </div>
  );
}
