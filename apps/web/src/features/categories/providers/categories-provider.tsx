"use client";

import { createContext, use } from "react";
import type { Category, CategoryOptions } from "@/features/categories/types";

// Promises, not resolved values: the layout starts the fetches without
// awaiting them (see dashboard/layout.tsx), so the shell and each page's
// loading skeleton can paint while a cold backend/database wakes up. Only
// the components that actually read the data suspend, in `use()` below.
interface CategoriesContextValue {
  categories: Promise<Category[]>;
  options: Promise<CategoryOptions>;
}

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

interface CategoriesProviderProps extends CategoriesContextValue {
  children: React.ReactNode;
}

/**
 * Makes the current user's categories - and the icon/color whitelist the
 * create-category form's grid renders from (see category.schema.ts) -
 * available to client components that need them (CategoryPicker,
 * CreateExpenseDialog's subtitle, CategoriesSection, CategoryForm)
 * without prop-drilling through every intermediate component. Seeded
 * once in dashboard/layout.tsx from getCategories()/
 * getCategoryOptions(), the same loaders Server Components
 * (category-badge.tsx, category-breakdown.tsx) call directly themselves.
 *
 * `categories` carries the raw domain Category[] (icon as a string key),
 * not CategoryDef[] - a CategoryDef's `Icon` is a live component
 * reference, and React can't serialize a function as a prop crossing this
 * Server Component -> Client Component boundary. Consumers that need the
 * resolved Icon component call resolveIcon(category.icon) or
 * resolveCategory()/toCategoryDef() themselves (category-palette.ts,
 * icon-registry.ts) - plain function calls, not a boundary crossing.
 */
export function CategoriesProvider({
  categories,
  options,
  children,
}: CategoriesProviderProps) {
  return (
    <CategoriesContext.Provider value={{ categories, options }}>
      {children}
    </CategoriesContext.Provider>
  );
}

function useCategoriesContext(): CategoriesContextValue {
  const value = use(CategoriesContext);
  if (value === null) {
    throw new Error("useCategories must be used within a CategoriesProvider");
  }
  return value;
}

export function useCategories(): Category[] {
  return use(useCategoriesContext().categories);
}

export function useCategoryOptions(): CategoryOptions {
  return use(useCategoriesContext().options);
}
