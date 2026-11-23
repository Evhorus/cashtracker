"use client";

import { createContext, useContext, useState } from "react";

interface CategoriesFilterContextValue {
  search: string;
  setSearch: (value: string) => void;
}

const CategoriesFilterContext =
  createContext<CategoriesFilterContextValue | null>(null);

// Lets the search box and the filtered results in CategoriesSection - two
// siblings under the same server-rendered page.tsx - share the search
// state, hence a context instead of prop drilling through the server
// component in between them.
export function CategoriesFilterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [search, setSearch] = useState("");

  // No useMemo: the React Compiler (reactCompiler: true in
  // next.config.ts) memoizes this object on the same dependencies it
  // would have been given by hand.
  return (
    <CategoriesFilterContext.Provider value={{ search, setSearch }}>
      {children}
    </CategoriesFilterContext.Provider>
  );
}

export function useCategoriesFilter() {
  const ctx = useContext(CategoriesFilterContext);
  if (!ctx) {
    throw new Error(
      "useCategoriesFilter must be used within a CategoriesFilterProvider",
    );
  }
  return ctx;
}
