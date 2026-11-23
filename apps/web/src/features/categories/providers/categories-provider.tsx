"use client";

import { createContext, use } from "react";

import type { Category, CategoryOptions } from "@/features/categories/types";

// Promises (not awaited values) so dashboard/layout.tsx paints immediately and consumers suspend via `use()`.
interface CategoriesContextValue {
  categories: Promise<Category[]>;
  options: Promise<CategoryOptions>;
}

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

interface CategoriesProviderProps extends CategoriesContextValue {
  children: React.ReactNode;
}

/**
 * Provides the user's categories and icon/color whitelist seeded in dashboard/layout.tsx.
 * Carries serializable `Category[]` (icon keys, not live components) across the Server -> Client boundary.
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
