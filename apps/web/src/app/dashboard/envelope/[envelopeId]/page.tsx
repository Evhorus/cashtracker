import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";

import {
  EnvelopeDetailView,
  type EnvelopeDetailSearchParams,
} from "@/features/envelopes/components/envelope-detail-view";
import { getEnvelopeById } from "@/features/envelopes/data/get-envelope-by-id";

interface EnvelopePageProps {
  params: Promise<{ envelopeId: string }>;
  searchParams: Promise<EnvelopeDetailSearchParams>;
}

export async function generateMetadata({
  params,
}: Pick<EnvelopePageProps, "params">): Promise<Metadata> {
  const { envelopeId } = await params;
  const envelope = await getEnvelopeById(envelopeId);
  return { title: envelope.name };
}

export default async function EnvelopePage({
  params,
  searchParams,
}: EnvelopePageProps) {
  await auth.protect();
  const [{ envelopeId }, query] = await Promise.all([params, searchParams]);

  return <EnvelopeDetailView envelopeId={envelopeId} searchParams={query} />;
}
