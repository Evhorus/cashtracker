"use client";

import dynamic from "next/dynamic";
import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { resolveIcon } from "../lib/icon-registry";
import { withAlpha } from "../lib/with-alpha";

const CategoryIconPickerGrid = dynamic(
  () =>
    import("./category-icon-picker-grid").then(
      (mod) => mod.CategoryIconPickerGrid,
    ),
  {
    loading: () => (
      <div className="space-y-2 p-2">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-52 w-full" />
      </div>
    ),
  },
);

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
 * Icon choice for the category form: a button showing the current icon that
 * opens a lazy-loaded searchable grid. Keeps the Spanish keyword dictionary
 * out of initial bundles until the picker is actually opened.
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
  const listboxId = useId();
  const [open, setOpen] = useState(false);

  // On an object, not a capitalized local - see category-badge.tsx.
  const selected = { Icon: resolveIcon(value) };

  const pick = (key: string) => {
    onChange(key);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
        {open && (
          <CategoryIconPickerGrid
            value={value}
            icons={icons}
            listboxId={listboxId}
            onPick={pick}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
