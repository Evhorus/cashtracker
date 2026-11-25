import { useTranslations } from "next-intl";

import { CardHoverActions } from "@/shared/components/common/card-hover-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { resolveIcon } from "../lib/icon-registry";
import type { Category } from "../types";
import { CategoryIconBadge } from "./category-icon-badge";
import type { CategoryToDelete } from "./delete-category-alert-dialog";
import { DeleteCategoryButton } from "./delete-category-button";
import { UpdateCategoryDialog } from "./update-category-dialog";

interface CategoriesTableProps {
  categories: Category[];
  categoryCounts: Record<string, number>;
  onDelete: (category: CategoryToDelete) => void;
}

// Desktop-only table; mobile renders CategoryCard in categories-section.tsx.
export function CategoriesTable({
  categories,
  categoryCounts,
  onDelete,
}: CategoriesTableProps) {
  const t = useTranslations("categories");
  return (
    <div className="hidden overflow-hidden rounded-2xl border border-border/60 bg-card/30 md:block">
      <Table className="min-w-max text-sm">
        <TableHeader>
          <TableRow className="border-border/60 bg-card/60 text-xs font-semibold tracking-wider text-muted-foreground uppercase hover:bg-card/60">
            <TableHead className="h-auto px-5 py-3 text-left font-semibold text-inherit">
              {t("table.category")}
            </TableHead>
            <TableHead className="h-auto px-5 py-3 text-right font-semibold text-inherit">
              {t("table.envelopes")}
            </TableHead>
            <TableHead className="h-auto px-5 py-3" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => {
            const count = categoryCounts[category.id] ?? 0;
            const Icon = resolveIcon(category.icon);
            return (
              <TableRow key={category.id} className="group border-border/60">
                <TableCell className="px-5 py-3.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <CategoryIconBadge
                      Icon={Icon}
                      color={category.color}
                      className="h-9 w-9"
                    />
                    <span className="truncate font-medium">
                      {category.label}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-3.5 text-right font-mono text-muted-foreground">
                  {t("envelopeCount", { count })}
                </TableCell>
                <TableCell className="px-5 py-3.5">
                  <CardHoverActions className="justify-end" alwaysVisible>
                    <UpdateCategoryDialog category={category} />
                    <DeleteCategoryButton
                      onClick={() =>
                        onDelete({ id: category.id, label: category.label })
                      }
                    />
                  </CardHoverActions>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
