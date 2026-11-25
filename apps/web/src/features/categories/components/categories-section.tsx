"use client";

import { useState } from "react";
import { SearchX } from "lucide-react";
import { useTranslations } from "next-intl";

import { useCategories } from "@/features/categories/providers/categories-provider";
import { EmptyState } from "@/shared/components/common/empty-state";
import { ListFilterBar } from "@/shared/components/common/list-filter-bar";
import { SearchInput } from "@/shared/components/common/search-input";
import { Text } from "@/shared/components/common/typography";
import { resolveIcon } from "../lib/icon-registry";
import { CategoriesTable } from "./categories-table";
import { CategoryCard } from "./category-card";
import {
  DeleteCategoryAlertDialog,
  type CategoryToDelete,
} from "./delete-category-alert-dialog";

interface CategoriesSectionProps {
  categoryCounts: Record<string, number>;
  actions?: React.ReactNode;
}

export function CategoriesSection({
  categoryCounts,
  actions,
}: CategoriesSectionProps) {
  const t = useTranslations("categories");
  const [search, setSearch] = useState("");
  const [toDelete, setToDelete] = useState<CategoryToDelete | null>(null);
  const categories = useCategories();

  const term = search.trim().toLowerCase();
  const filtered = categories.filter(
    (category) => !term || category.label.toLowerCase().includes(term),
  );

  const totalEnvelopesCategorized = filtered.reduce(
    (sum, category) => sum + (categoryCounts[category.id] ?? 0),
    0,
  );

  return (
    <div className="space-y-6">
      <ListFilterBar
        actions={actions}
        renderSearch={(className) => (
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchAria")}
            className={className}
          />
        )}
      />

      <Text>
        {t("summary", {
          categories: filtered.length,
          envelopes: totalEnvelopesCategorized,
        })}
      </Text>

      {filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={
            search
              ? t("empty.noResultsTitle", { query: search })
              : t("empty.noneTitle")
          }
          description={search ? t("empty.noResultsBody") : t("empty.noneBody")}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filtered.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                count={categoryCounts[category.id] ?? 0}
                Icon={resolveIcon(category.icon)}
                onDelete={setToDelete}
              />
            ))}
          </div>
          <CategoriesTable
            categories={filtered}
            categoryCounts={categoryCounts}
            onDelete={setToDelete}
          />
        </>
      )}

      <DeleteCategoryAlertDialog
        category={toDelete}
        onOpenChange={(open) => {
          if (!open) setToDelete(null);
        }}
      />
    </div>
  );
}
