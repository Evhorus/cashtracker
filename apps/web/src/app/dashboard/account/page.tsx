import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";

import { AccountView } from "@/features/account/components/account-view";
import { PageHeader } from "@/features/dashboard/components/page-header";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account");
  return { title: t("title") };
}

export default async function AccountPage() {
  await auth.protect();
  const t = await getTranslations("account");

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("subtitle")}
        backUrl="/dashboard"
      />
      <AccountView />
    </div>
  );
}
