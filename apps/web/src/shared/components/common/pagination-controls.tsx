import { getTranslations } from "next-intl/server";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/components/ui/pagination";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
}

function buildHref(
  basePath: string,
  page: number,
  extra?: Record<string, string | undefined>,
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(extra ?? {})) {
    if (value) params.set(key, value);
  }
  params.set("page", String(page));
  return `${basePath}?${params.toString()}`;
}

function getPageRange(current: number, total: number) {
  const range: (number | "ellipsis")[] = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);

  if (left > 2) range.push("ellipsis");
  for (let page = left; page <= right; page++) range.push(page);
  if (right < total - 1) range.push("ellipsis");
  if (total > 1) range.push(total);

  return range;
}

export const PaginationControls = async ({
  page,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  basePath,
  searchParams,
}: PaginationControlsProps) => {
  if (totalPages <= 1) return null;

  const t = await getTranslations("pagination");
  const pages = getPageRange(page, totalPages);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          {/* Use `inert` instead of `tabIndex`: Base UI manages tabIndex on non-native buttons and would mismatch on hydration. */}
          <PaginationPrevious
            href={buildHref(basePath, Math.max(1, page - 1), searchParams)}
            text={t("previous")}
            aria-label={t("goToPrevious")}
            aria-disabled={!hasPreviousPage}
            inert={!hasPreviousPage}
            className={
              hasPreviousPage ? undefined : "pointer-events-none opacity-50"
            }
          />
        </PaginationItem>

        {pages.map((entry, index) =>
          entry === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={entry}>
              <PaginationLink
                href={buildHref(basePath, entry, searchParams)}
                isActive={entry === page}
                aria-label={t("goToPage", { page: entry })}
              >
                {entry}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext
            href={buildHref(
              basePath,
              Math.min(totalPages, page + 1),
              searchParams,
            )}
            text={t("next")}
            aria-label={t("goToNext")}
            aria-disabled={!hasNextPage}
            inert={!hasNextPage}
            className={
              hasNextPage ? undefined : "pointer-events-none opacity-50"
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
