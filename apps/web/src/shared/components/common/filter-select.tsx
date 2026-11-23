"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

export interface FilterOption {
  value: string;
  label: string;
  /** Draws a divider above this option (e.g. separating composite views from plain statuses). */
  separatorBefore?: boolean;
}

interface FilterSelectProps {
  /** Filter dimension prefix shown in the trigger before the active value. */
  label: string;
  value: string;
  options: FilterOption[];
  onValueChange: (value: string) => void;
  className?: string;
}

/** Presentational labelled filter select (callers own URL params vs. client state). */
export function FilterSelect({
  label,
  value,
  options,
  onValueChange,
  className,
}: FilterSelectProps) {
  return (
    <Select value={value} onValueChange={(next) => onValueChange(String(next))}>
      <SelectTrigger className={className} aria-label={label}>
        <SelectValue>
          {(current: string) => (
            <span className="flex items-center gap-1.5">
              <span className="text-muted-foreground">{label}:</span>
              <span className="font-medium">
                {options.find((option) => option.value === current)?.label ??
                  current}
              </span>
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <div key={option.value}>
            {option.separatorBefore && <SelectSeparator />}
            <SelectItem value={option.value}>{option.label}</SelectItem>
          </div>
        ))}
      </SelectContent>
    </Select>
  );
}
