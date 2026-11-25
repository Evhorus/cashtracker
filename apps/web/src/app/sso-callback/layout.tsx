import { ClerkProvider } from "@clerk/nextjs";

import { getClerkLocalization } from "@/shared/config/i18n/clerk-localization";

// Kept outside (auth)/ so it skips the "redirect if signed in" guard while an OAuth session is being created.
export default async function SSOCallbackLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkLocalization = await getClerkLocalization();

  return (
    <ClerkProvider localization={clerkLocalization}>{children}</ClerkProvider>
  );
}
