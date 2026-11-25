import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";

import { HomeView } from "@/features/home/components/home-view";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home.meta");

  return {
    // Omit `title` so the root layout's default is used without wrapping it in the "%s | CashTracker" template.
    description: t("description"),
    keywords: t("keywords").split(", "),
    authors: [{ name: "CashTracker Team" }],
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      type: "website",
      locale: t("ogLocale"),
      siteName: "CashTracker",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: t("title"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("twitterDescription"),
      images: ["/og-image.png"],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Resource-level auth check (not middleware) redirects signed-in users to /dashboard using the verified session.
export default async function HomePage() {
  const { isAuthenticated } = await auth();
  if (isAuthenticated) redirect("/dashboard");

  return <HomeView />;
}
