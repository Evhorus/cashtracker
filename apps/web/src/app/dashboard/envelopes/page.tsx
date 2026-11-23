import { Suspense } from "react";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/features/dashboard/components/page-header";
import { CreateEnvelopeDialog } from "@/features/envelopes/components/create-envelope-dialog";
import { EnvelopesFilter } from "@/features/envelopes/components/envelopes-filter";
import { EnvelopesGrid } from "@/features/envelopes/components/envelopes-grid";
import { EnvelopesResultsSkeleton } from "@/features/envelopes/components/envelopes-list-skeleton";
import {
  ENVELOPE_STATUS_TAB_VALUES,
  ENVELOPES_DEFAULT_PAGE_SIZE,
  ENVELOPES_PAGE_SIZE_OPTIONS,
  parseEnvelopeSort,
  type EnvelopeSort,
  type EnvelopeStatusTab,
} from "@/features/envelopes/lib/envelope-helpers";
import { EnvelopesService } from "@/features/envelopes/services/envelopes.service";
import { PaginationControls } from "@/shared/components/common/pagination-controls";
import { Text } from "@/shared/components/common/typography";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("envelopes");
  return { title: t("title") };
}

interface EnvelopesPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    sort?: string;
    limit?: string;
  }>;
}

export default async function EnvelopesPage({
  searchParams,
}: EnvelopesPageProps) {
  await auth.protect();
  const t = await getTranslations("envelopes");
  const {
    page: pageParam,
    search,
    status: statusParam,
    sort: sortParam,
    limit: limitParam,
  } = await searchParams;
  const sort = parseEnvelopeSort(sortParam);
  const page = pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1;
  const status: EnvelopeStatusTab = ENVELOPE_STATUS_TAB_VALUES.some(
    (filter) => filter === statusParam,
  )
    ? (statusParam as EnvelopeStatusTab)
    : "all";
  const limitValue = Number(limitParam);
  const limit = ENVELOPES_PAGE_SIZE_OPTIONS.some(
    (option) => option === limitValue,
  )
    ? limitValue
    : ENVELOPES_DEFAULT_PAGE_SIZE;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        backUrl="/dashboard"
        mobileActions={<CreateEnvelopeDialog />}
      />

      <EnvelopesFilter actions={<CreateEnvelopeDialog />} />

      {/* Key remounts on filter change so the skeleton shows immediately while refetching. */}
      <Suspense
        key={`${page}-${search ?? ""}-${status}-${sort}-${limit}`}
        fallback={
          <div className="space-y-6">
            <EnvelopesResultsSkeleton />
          </div>
        }
      >
        <EnvelopesResults
          page={page}
          search={search}
          status={status}
          sort={sort}
          limit={limit}
        />
      </Suspense>
    </div>
  );
}

interface EnvelopesResultsProps {
  page: number;
  search?: string;
  status: EnvelopeStatusTab;
  sort: EnvelopeSort;
  limit: number;
}

async function EnvelopesResults({
  page,
  search,
  status,
  sort,
  limit,
}: EnvelopesResultsProps) {
  const t = await getTranslations("envelopes");
  const { data, meta } = await EnvelopesService.getAll({
    page,
    limit,
    search,
    status,
    sort,
  });

  return (
    <div className="space-y-6">
      <Text>{t("count", { count: meta.total })}</Text>

      <EnvelopesGrid
        envelopes={data}
        searchQuery={search}
        statusFilter={status}
      />

      <PaginationControls
        page={meta.page}
        totalPages={meta.totalPages}
        hasNextPage={meta.hasNextPage}
        hasPreviousPage={meta.hasPreviousPage}
        basePath="/dashboard/envelopes"
        searchParams={{
          search,
          status: status === "all" ? undefined : status,
          sort: sort === "recent" ? undefined : sort,
          limit:
            limit === ENVELOPES_DEFAULT_PAGE_SIZE ? undefined : String(limit),
        }}
      />
    </div>
  );
}
