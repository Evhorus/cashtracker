import { Suspense } from "react";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";

import { CategoriesSection } from "@/features/categories/components/categories-section";
import { CreateCategoryDialog } from "@/features/categories/components/create-category-dialog";
import { CategoriesService } from "@/features/categories/services/categories.service";
import { PageHeader } from "@/features/dashboard/components/page-header";
import { Skeleton } from "@/shared/components/ui/skeleton";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("categories");
  return { title: t("title") };
}

export default async function CategoriesPage() {
  await auth.protect();
  const t = await getTranslations("categories");

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        backUrl="/dashboard"
        mobileActions={<CreateCategoryDialog />}
      />

      <Suspense fallback={<CategoriesContentSkeleton />}>
        <CategoriesContent />
      </Suspense>
    </div>
  );
}

async function CategoriesContent() {
  const categoryCounts = await CategoriesService.getUsage();

  return (
    <CategoriesSection
      categoryCounts={categoryCounts}
      actions={<CreateCategoryDialog />}
    />
  );
}

function CategoriesContentSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <Skeleton className="h-9 w-full md:w-64 md:shrink-0" />
        <Skeleton className="hidden h-10 w-36 md:ml-auto md:block" />
      </div>

      <div className="grid grid-cols-1 gap-3 md:hidden">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <Skeleton className="hidden h-96 rounded-xl md:block" />
    </div>
  );
}
