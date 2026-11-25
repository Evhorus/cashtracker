import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Card, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { Category } from "../types";
import { CategoryIconBadge } from "./category-icon-badge";
import type { CategoryToDelete } from "./delete-category-alert-dialog";
import { DeleteCategoryButton } from "./delete-category-button";
import { UpdateCategoryDialog } from "./update-category-dialog";

interface CategoryCardProps {
  category: Category;
  count: number;
  /** Pre-resolved via resolveIcon() by the caller (see category-icon-badge.tsx). */
  Icon: LucideIcon;
  onDelete: (category: CategoryToDelete) => void;
}

export function CategoryCard({
  category,
  count,
  Icon,
  onDelete,
}: CategoryCardProps) {
  const t = useTranslations("categories");
  return (
    <Card className="group relative h-full overflow-hidden border-border/60 bg-card/50 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-card hover:shadow-lg">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-transparent to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <CardHeader className="relative z-10 flex flex-row items-center justify-between gap-2 space-y-0">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <CategoryIconBadge
            Icon={Icon}
            color={category.color}
            className="h-10 w-10 rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110"
            iconClassName="h-5 w-5"
          />

          <div className="min-w-0 space-y-1">
            <CardTitle className="text-lg leading-none font-bold tracking-tight transition-colors duration-200 group-hover:text-primary">
              <span className="block truncate">{category.label}</span>
            </CardTitle>
            <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              {t("envelopeCount", { count })}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center">
          <UpdateCategoryDialog category={category} />
          <DeleteCategoryButton
            onClick={() => onDelete({ id: category.id, label: category.label })}
          />
        </div>
      </CardHeader>
    </Card>
  );
}
