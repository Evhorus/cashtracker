import type { ReactNode } from "react";

import { Text } from "@/shared/components/common/typography";

interface RankedBarListProps<T> {
  items: T[];
  getKey: (item: T) => string;
  getValue: (item: T) => number;
  formatValue: (value: number) => string;
  renderLabel: (item: T) => ReactNode;
  getBarColor?: (item: T) => string | undefined;
  emptyMessage: string;
}

export function RankedBarList<T>({
  items,
  getKey,
  getValue,
  formatValue,
  renderLabel,
  getBarColor,
  emptyMessage,
}: RankedBarListProps<T>) {
  if (items.length === 0) {
    return <Text className="py-6 text-center">{emptyMessage}</Text>;
  }

  const total = items.reduce((sum, item) => sum + getValue(item), 0);

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const value = getValue(item);
        const percentage = total > 0 ? (value / total) * 100 : 0;
        const barColor = getBarColor?.(item);

        return (
          <div key={getKey(item)}>
            <div className="flex items-center justify-between text-sm">
              {renderLabel(item)}
              <span className="flex items-baseline gap-1.5 font-mono">
                <span className="text-sm font-semibold">
                  {formatValue(value)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {percentage.toFixed(0)}%
                </span>
              </span>
            </div>
            {/* Decorative: the percentage is already stated in the row above. */}
            <div
              aria-hidden="true"
              className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary/60"
            >
              <div
                className={
                  barColor
                    ? "h-full rounded-full"
                    : "h-full rounded-full bg-primary"
                }
                style={
                  barColor
                    ? { width: `${percentage}%`, background: barColor }
                    : { width: `${percentage}%` }
                }
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
