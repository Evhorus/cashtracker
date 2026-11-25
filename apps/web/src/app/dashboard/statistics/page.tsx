import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";

import {
  StatisticsView,
  type StatisticsSearchParams,
} from "@/features/dashboard/components/statistics-view";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("statistics");
  return { title: t("title") };
}

interface StatisticsPageProps {
  searchParams: Promise<StatisticsSearchParams>;
}

export default async function StatisticsPage({
  searchParams,
}: StatisticsPageProps) {
  await auth.protect();

  return <StatisticsView searchParams={await searchParams} />;
}
