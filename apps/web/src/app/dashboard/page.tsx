import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";

import { DashboardOverviewView } from "@/features/dashboard/components/dashboard-overview-view";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard");
  return { title: t("title") };
}

export default async function DashboardPage() {
  await auth.protect();

  return <DashboardOverviewView />;
}
