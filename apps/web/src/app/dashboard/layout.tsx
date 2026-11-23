import type { Metadata } from "next";
import { CustomHeader } from "@/features/dashboard/components/custom-header";
import { MobileNav } from "@/features/dashboard/components/mobile-nav";
import { DashboardSidebar } from "@/features/dashboard/components/dashboard-sidebar";
import { ClerkProvider } from "@clerk/nextjs";
import { getClerkLocalization } from "@/shared/config/i18n/clerk-localization";
import { auth } from "@clerk/nextjs/server";
import { CategoriesProvider } from "@/features/categories/providers/categories-provider";
import { getCategories } from "@/features/categories/data/get-categories";
import { getCategoryOptions } from "@/features/categories/data/get-category-options";
import { PaymentMethodsProvider } from "@/features/payment-methods/providers/payment-methods-provider";
import { getPaymentMethods } from "@/features/payment-methods/data/get-payment-methods";

// The dashboard is behind auth and has nothing to offer a crawler, so
// it opts out of indexing explicitly rather than relying on the login
// redirect to keep it out. Pages under here set their own `title` and
// pick up the root layout's "%s | CashTracker" template.
export const metadata: Metadata = {
  // "Dashboard" is the product's own word for this area in both
  // languages, so it stays a constant - unlike the pages underneath,
  // which each set a translated title through generateMetadata.
  title: { default: "Dashboard", template: "%s | CashTracker" },
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await auth.protect();

  // Started here but deliberately NOT awaited. Awaiting them blocked the
  // whole layout, and with the backend/database asleep (Render + Neon
  // cold start, several seconds) the user saw an empty dark screen:
  // loading.tsx sits *inside* this layout, so it cannot show until the
  // layout itself has rendered. As promises, the shell paints at once and
  // each page's skeleton streams in; only the client components that read
  // them (via use(), see providers/) wait. They also seed the per-request
  // cache Server Components reuse through getCategories() etc. (React's
  // cache()). A rejection surfaces at the reading component, where
  // error.tsx catches it.
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
            {/* min-w-0 so this column can actually shrink below its content's
              intrinsic width next to the sidebar - without it a wide child
              (e.g. the envelopes table) pushes the whole flex row wider than
              the viewport instead of scrolling internally. overflow-y-auto
              makes this column its own scroll container now that the shell
              above is a fixed-height, overflow-hidden viewport. */}
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
