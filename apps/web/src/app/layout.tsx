import "./globals.css";

import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";

import { ScrollToTop } from "@/shared/components/common/scroll-to-top";
import { Toaster } from "@/shared/components/ui/sonner";
import { env } from "@/shared/config/env.server";
import { ThemeProvider } from "@/shared/providers/theme-provider";
import { manrope, plexMono, sourceSerif } from "./fonts";

// App-wide metadata defaults and metadataBase so relative OG/Twitter URLs resolve on every route.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home.meta");

  return {
    metadataBase: new URL(env.NEXT_PUBLIC_URL),
    title: {
      default: t("title"),
      template: "%s | CashTracker",
    },
    description: t("description"),
    applicationName: "CashTracker",
  };
}

// ClerkProvider lives in (auth) and dashboard layouts so public marketing routes omit Clerk's client bundle.
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Locale is cookie-based (no [locale] route segment), so read it server-side for <html lang>.
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${manrope.variable} ${sourceSerif.variable} ${plexMono.variable}`}
    >
      {/* Font CSS variables live on <html> so globals.css :root/.dark selectors can resolve them. */}
      <body className="antialiased">
        <ScrollToTop />
        <NextIntlClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Analytics />
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
