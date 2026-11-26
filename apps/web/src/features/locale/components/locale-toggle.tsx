"use client";

import { useTransition } from "react";
import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from "@/shared/config/i18n/config";
import { cn } from "@/shared/lib/utils";
import { setLocaleAction } from "@/features/locale/actions/set-locale.action";

/** Locale switcher; option labels stay in their native language so they remain readable regardless of active locale. */
export function LocaleToggle({ className }: { className?: string }) {
  const currentLocale = useLocale();
  const t = useTranslations("locale");
  const [isPending, startTransition] = useTransition();

  const select = (locale: SupportedLocale) => {
    if (locale === currentLocale) return;
    startTransition(() => setLocaleAction(locale));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            disabled={isPending}
            className={cn(className)}
            aria-label={t("label")}
          >
            <Languages className="size-5" />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {SUPPORTED_LOCALES.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => select(locale)}
            className={cn(locale === currentLocale && "font-semibold")}
          >
            {LOCALE_LABELS[locale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
