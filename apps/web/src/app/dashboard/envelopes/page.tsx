import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";

import {
  EnvelopesView,
  type EnvelopesSearchParams,
} from "@/features/envelopes/components/envelopes-view";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("envelopes");
  return { title: t("title") };
}

interface EnvelopesPageProps {
  searchParams: Promise<EnvelopesSearchParams>;
}

export default async function EnvelopesPage({
  searchParams,
}: EnvelopesPageProps) {
  await auth.protect();

  return <EnvelopesView searchParams={await searchParams} />;
}
