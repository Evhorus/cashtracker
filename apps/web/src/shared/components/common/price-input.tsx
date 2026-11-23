import {
  useState,
  type ChangeEvent,
  type FocusEvent,
  type InputHTMLAttributes,
} from "react";
import type { ControllerRenderProps, FieldValues } from "react-hook-form";

import { Input } from "@/shared/components/ui/input";
import {
  DEFAULT_CURRENCY_CONFIG,
  formatNumber,
  parseNumericValue,
  type CurrencyConfig,
} from "@/shared/utils/format-currency";

export interface PriceInputProps<T extends FieldValues> extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "disabled" | "type"
> {
  value: string | undefined;
  onChange: ControllerRenderProps<T>["onChange"];
  disabled?: boolean;
  currencyConfig?: CurrencyConfig;
}

// Splits raw input into integer/fractional digits; if digits after the last
// separator exceed `maxDecimals`, treats all separators as thousands grouping.
function splitDecimalInput(
  raw: string,
  maxDecimals: number,
): { integerDigits: string; fractionalDigits?: string } {
  const decimalIndex =
    maxDecimals > 0 ? Math.max(raw.lastIndexOf("."), raw.lastIndexOf(",")) : -1;

  if (decimalIndex === -1) {
    return { integerDigits: raw.replace(/[^0-9]/g, "") };
  }

  const tailDigits = raw.slice(decimalIndex + 1).replace(/[^0-9]/g, "");
  if (tailDigits.length > maxDecimals) {
    return { integerDigits: raw.replace(/[^0-9]/g, "") };
  }

  return {
    integerDigits: raw.slice(0, decimalIndex).replace(/[^0-9]/g, ""),
    fractionalDigits: tailDigits,
  };
}

/** Currency-aware amount input: ungrouped while focused to avoid decimal/thousands ambiguity, grouped on blur. */
export function PriceInput<T extends FieldValues>({
  value,
  onChange,
  disabled,
  currencyConfig = DEFAULT_CURRENCY_CONFIG,
  onFocus: fieldOnFocus,
  onBlur: fieldOnBlur,
  ...field
}: PriceInputProps<T>) {
  const [isFocused, setIsFocused] = useState(false);
  const [editableText, setEditableText] = useState("");

  const allowsDecimals = currencyConfig.decimalDigits > 0;
  const decimalSeparator = currencyConfig.locale.startsWith("en") ? "." : ",";

  const formattedValue = (() => {
    if (value === undefined || value === "") return "";
    const num = parseNumericValue(value);
    if (num === 0) return "";
    const minimumFractionDigits = value.includes(".")
      ? currencyConfig.decimalDigits
      : 0;
    return formatNumber(num, currencyConfig, minimumFractionDigits);
  })();

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    setEditableText(
      value && value !== "" ? value.replace(".", decimalSeparator) : "",
    );
    fieldOnFocus?.(e);
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    fieldOnBlur?.(e);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { integerDigits, fractionalDigits } = splitDecimalInput(
      e.target.value,
      currencyConfig.decimalDigits,
    );

    if (integerDigits === "" && !fractionalDigits) {
      setEditableText("");
      onChange("");
      return;
    }

    setEditableText(
      fractionalDigits !== undefined
        ? `${integerDigits}${decimalSeparator}${fractionalDigits}`
        : integerDigits,
    );

    // Always emit canonical "." decimal form for the form and API.
    onChange(
      fractionalDigits !== undefined
        ? `${integerDigits || "0"}.${fractionalDigits}`
        : integerDigits,
    );
  };

  return (
    <div className="relative">
      <span className="absolute top-1/2 left-3 -translate-y-1/2 font-medium text-muted-foreground">
        {currencyConfig.symbol}
      </span>
      <Input
        {...field}
        type="text"
        inputMode={allowsDecimals ? "decimal" : "numeric"}
        className="pl-8"
        value={isFocused ? editableText : formattedValue}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        placeholder="0"
        autoComplete="off"
        disabled={disabled}
      />
    </div>
  );
}
