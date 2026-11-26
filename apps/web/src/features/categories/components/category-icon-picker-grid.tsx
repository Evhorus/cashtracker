"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { Text } from "@/shared/components/common/typography";
import { Input } from "@/shared/components/ui/input";
import { useIsDesktop } from "@/shared/hooks/use-media-query";
import { cn } from "@/shared/lib/utils";
import {
  iconLabel,
  searchIcons,
} from "@/features/categories/lib/icon-keywords";
import { resolveIcon } from "@/features/categories/lib/icon-registry";

interface CategoryIconPickerGridProps {
  value: string;
  icons: readonly string[];
  listboxId: string;
  onPick: (key: string) => void;
}

/** Code-split via next/dynamic in CategoryIconPicker so icon-keywords.ts loads only when opened. */
export function CategoryIconPickerGrid({
  value,
  icons,
  listboxId,
  onPick,
}: CategoryIconPickerGridProps) {
  const t = useTranslations("categories.form");
  const tCommon = useTranslations("common");
  const isDesktop = useIsDesktop();
  const locale = useLocale();
  const [query, setQuery] = useState("");

  const matches = searchIcons(icons, query);

  return (
    <>
      <div className="p-2">
        {/* Desktop only: mobile autoFocus opens the keyboard over the icon grid. */}
        <Input
          autoFocus={isDesktop}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("iconSearch")}
          aria-label={t("iconSearch")}
        />
      </div>

      {matches.length === 0 ? (
        <Text className="px-2 pt-1 pb-4 text-center">
          {tCommon("noResults")}
        </Text>
      ) : (
        <div
          id={listboxId}
          role="listbox"
          aria-label={t("icon")}
          className="grid max-h-64 grid-cols-6 gap-1 overflow-y-auto p-2 pt-0"
        >
          {matches.map((key) => {
            const option = { Icon: resolveIcon(key) };
            const isSelected = key === value;
            return (
              <button
                key={key}
                type="button"
                role="option"
                aria-selected={isSelected}
                aria-label={iconLabel(key, locale)}
                title={iconLabel(key, locale)}
                onClick={() => onPick(key)}
                className={cn(
                  "flex h-10 items-center justify-center rounded-md border transition-colors",
                  isSelected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <option.Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
