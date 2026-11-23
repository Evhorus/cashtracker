"use client";

import { Check } from "lucide-react";

import { cn } from "@/shared/lib/utils";

interface ColorSwatchPickerProps {
  id?: string;
  colors: readonly string[];
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
  ariaLabelPrefix: string;
  ariaLabelledBy?: string;
  ariaInvalid?: boolean;
}

export function ColorSwatchPicker({
  id,
  colors,
  value,
  onChange,
  disabled,
  ariaLabelPrefix,
  ariaLabelledBy,
  ariaInvalid,
}: ColorSwatchPickerProps) {
  return (
    <div
      id={id}
      role="radiogroup"
      aria-labelledby={ariaLabelledBy}
      aria-invalid={ariaInvalid}
      className="flex flex-wrap gap-2"
    >
      {colors.map((color, index) => {
        const selected = value === color;
        return (
          <button
            key={color}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`${ariaLabelPrefix} ${index + 1}`}
            disabled={disabled}
            onClick={() => onChange(color)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-transform",
              selected
                ? "scale-110 border-foreground/80"
                : "border-transparent",
            )}
            style={{ background: color }}
          >
            {selected && <Check className="h-4 w-4 text-white drop-shadow" />}
          </button>
        );
      })}
    </div>
  );
}
