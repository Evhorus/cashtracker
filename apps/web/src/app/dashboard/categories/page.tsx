import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";

import { CategoriesView } from "@/features/categories/components/categories-view";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("categories");
  return { title: t("title") };
}

export default async function CategoriesPage() {
  await auth.protect();

  return <CategoriesView />;
}
