"use client";

import { useId, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";

import { Input } from "@/shared/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Text } from "@/shared/components/common/typography";
import { useIsDesktop } from "@/shared/hooks/use-media-query";
import { cn } from "@/shared/lib/utils";
import { iconLabel, resolveIcon, searchIcons } from "../lib/icon-registry";
import { withAlpha } from "../lib/with-alpha";

interface CategoryIconPickerProps {
  /** The selected icon key. */
  value: string;
  onChange: (key: string) => void;
  /** Every key the backend accepts, in the order to show them. */
  icons: readonly string[];
  /** Tints the preview, so the choice reads as it will on the list. */
  color?: string;
  disabled?: boolean;
  id?: string;
  "aria-invalid"?: boolean;
}

/**
 * Icon choice for the category form: a button showing the current icon
 * that opens a searchable grid. With 150+ icons a fixed grid inside the
 * form was too long to scan and pushed the colors out of view; the
 * popover keeps the form short and lets the user type "casa" or "gym"
 * instead of hunting.
 */
export function CategoryIconPicker({
  value,
  onChange,
  icons,
  color,
  disabled,
  id,
  "aria-invalid": ariaInvalid,
}: CategoryIconPickerProps) {
  const t = useTranslations("categories.form");
  const tCommon = useTranslations("common");
  const isDesktop = useIsDesktop();
  const locale = useLocale();
  const listboxId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // On an object, not a capitalized local - see category-badge.tsx.
  const selected = { Icon: resolveIcon(value) };
  const matches = searchIcons(icons, query);

  const pick = (key: string) => {
    onChange(key);
    setOpen(false);
    setQuery("");
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <PopoverTrigger
        render={
          <button
            id={id}
            type="button"
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-invalid={ariaInvalid}
            disabled={disabled}
            className="flex h-11 w-full items-center gap-3 rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive dark:bg-input/30"
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground"
              style={
                color
                  ? { background: withAlpha(color, 0.16), color }
                  : undefined
              }
            >
              <selected.Icon className="h-4 w-4" />
            </span>
            <span className="flex-1 text-left text-muted-foreground">
              {t("changeIcon")}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        }
      />
      <PopoverContent align="start" className="w-80 gap-0 p-0">
        <div className="p-2">
          {/* Desktop only, like the other forms: on a phone it opens the
              keyboard over the very grid this popover is for. */}
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
                  onClick={() => pick(key)}
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
      </PopoverContent>
    </Popover>
  );
}
