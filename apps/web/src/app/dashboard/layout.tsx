import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

import { getCategories } from "@/features/categories/data/get-categories";
import { getCategoryOptions } from "@/features/categories/data/get-category-options";
import { CategoriesProvider } from "@/features/categories/providers/categories-provider";
import { CustomHeader } from "@/features/dashboard/components/custom-header";
import { DashboardSidebar } from "@/features/dashboard/components/dashboard-sidebar";
import { MobileNav } from "@/features/dashboard/components/mobile-nav";
import { getPaymentMethods } from "@/features/payment-methods/data/get-payment-methods";
import { PaymentMethodsProvider } from "@/features/payment-methods/providers/payment-methods-provider";
import { getClerkLocalization } from "@/shared/config/i18n/clerk-localization";

// Authenticated area: opt out of crawler indexing.
export const metadata: Metadata = {
  // "Dashboard" stays untranslated as a product term across locales.
  title: { default: "Dashboard", template: "%s | CashTracker" },
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await auth.protect();

  // Start fetches without awaiting so the layout shell and route `loading.tsx` skeletons paint immediately
  // during cold starts; client consumers suspend via `use()` and Server Components hit the `React.cache` entries.
  const categories = getCategories();
  const options = getCategoryOptions();
  const paymentMethods = getPaymentMethods();
  const clerkLocalization = await getClerkLocalization();

  return (
    <ClerkProvider localization={clerkLocalization}>
      <CategoriesProvider categories={categories} options={options}>
        <PaymentMethodsProvider paymentMethods={paymentMethods}>
          <div className="fixed inset-0 flex overflow-hidden bg-background">
            <DashboardSidebar />
            {/* min-w-0 lets wide children (e.g. tables) scroll internally inside the fixed-height flex shell. */}
            <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
              <CustomHeader />
              <main className="container mx-auto px-4 py-6 pb-24 md:pb-6">
                {children}
              </main>
              <MobileNav />
            </div>
          </div>
        </PaymentMethodsProvider>
      </CategoriesProvider>
    </ClerkProvider>
  );
}
