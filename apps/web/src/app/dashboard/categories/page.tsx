import type { Metadata } from "next";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/features/dashboard/components/page-header";
import { getCategoryUsage } from "@/features/categories/data/get-category-usage";
import { CategoriesSection } from "@/features/categories/components/categories-section";
import { CategoriesFilterProvider } from "@/features/categories/components/categories-filter-context";
import { CreateCategoryDialog } from "@/features/categories/components/create-category-dialog";
import { Skeleton } from "@/shared/components/ui/skeleton";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("categories");
  return { title: t("title") };
}

// Force dynamic rendering because this page uses Clerk auth, same as
// account/page.tsx and dashboard/envelopes/page.tsx.
export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  await auth.protect();
  const t = await getTranslations("categories");

  return (
    <CategoriesFilterProvider>
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
    </CategoriesFilterProvider>
  );
}

async function CategoriesContent() {
  const categoryCounts = await getCategoryUsage();

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
      <div className="space-y-3">
        <Skeleton className="h-9 w-full md:hidden" />
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Skeleton className="hidden h-9 w-64 shrink-0 md:block" />
          <Skeleton className="h-9 w-full sm:w-72" />
          <Skeleton className="hidden h-10 w-36 md:ml-auto md:block" />
        </div>
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
