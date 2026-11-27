"use client";

import { useTranslations } from "next-intl";

import {
  ENVELOPE_SORT_VALUES,
  ENVELOPE_STATUS_TAB_VALUES,
  ENVELOPES_DEFAULT_PAGE_SIZE,
  ENVELOPES_MAX_PAGE_SIZE,
  ENVELOPES_PAGE_SIZE_OPTIONS,
  parseEnvelopeSort,
  type EnvelopeSort,
  type EnvelopeStatusTab,
} from "@/features/envelopes/lib/envelope-helpers";
import { useFilterPending } from "@/shared/components/common/filter-pending";
import { FilterSelect } from "@/shared/components/common/filter-select";
import { ListFilterBar } from "@/shared/components/common/list-filter-bar";
import { SearchInput } from "@/shared/components/common/search-input";
import { useDebouncedSearchParam } from "@/shared/hooks/use-debounced-search-param";

export function statusFilterLabel(
  t: ReturnType<typeof useTranslations<"envelopes">>,
  filter: EnvelopeStatusTab,
): string {
  if (filter === "all") return t("filters.all");
  if (filter === "alert") return t("filters.alert");
  return t(`status.${filter}`);
}

/** Updates a single URL query param and resets pagination back to page 1. */
function useUrlFilterParam(key: string, defaultValue: string) {
  const { effectiveSearchParams, updateParams } = useFilterPending();

  const update = (value: string) => {
    updateParams((params) => {
      if (value === defaultValue) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
  };

  return { rawValue: effectiveSearchParams.get(key), update };
}

const EnvelopesSearch = ({ className }: { className?: string }) => {
  const t = useTranslations("envelopes");
  const { value, onChange } = useDebouncedSearchParam();

  return (
    <SearchInput
      value={value}
      onChange={onChange}
      placeholder={t("searchPlaceholder")}
      aria-label={t("searchAria")}
      className={className}
    />
  );
};

const EnvelopesStatusFilter = () => {
  const t = useTranslations("envelopes");
  const tCommon = useTranslations("common");
  const { rawValue, update } = useUrlFilterParam("status", "all");

  const status: EnvelopeStatusTab = ENVELOPE_STATUS_TAB_VALUES.some(
    (filter) => filter === rawValue,
  )
    ? (rawValue as EnvelopeStatusTab)
    : "all";

  return (
    <FilterSelect
      label={tCommon("status")}
      value={status}
      onValueChange={update}
      className="w-full sm:w-auto"
      options={ENVELOPE_STATUS_TAB_VALUES.map((filter) => ({
        value: filter,
        label: statusFilterLabel(t, filter),
        separatorBefore: filter === "alert",
      }))}
    />
  );
};

const pageSizeLabel = (
  t: ReturnType<typeof useTranslations<"envelopes">>,
  size: number,
) => (size === ENVELOPES_MAX_PAGE_SIZE ? t("pageSizeAll") : String(size));

const EnvelopesPageSizeFilter = () => {
  const t = useTranslations("envelopes");
  const { rawValue, update } = useUrlFilterParam(
    "limit",
    String(ENVELOPES_DEFAULT_PAGE_SIZE),
  );

  const limitParam = Number(rawValue);
  const pageSize = ENVELOPES_PAGE_SIZE_OPTIONS.some(
    (option) => option === limitParam,
  )
    ? limitParam
    : ENVELOPES_DEFAULT_PAGE_SIZE;

  return (
    <FilterSelect
      label={t("perPage")}
      value={String(pageSize)}
      onValueChange={update}
      className="w-full sm:w-auto"
      options={ENVELOPES_PAGE_SIZE_OPTIONS.map((option) => ({
        value: String(option),
        label: pageSizeLabel(t, option),
      }))}
    />
  );
};

const EnvelopesSortFilter = () => {
  const t = useTranslations("envelopes");
  const { rawValue, update } = useUrlFilterParam("sort", "recent");
  const sort = parseEnvelopeSort(rawValue);

  return (
    <FilterSelect
      label={t("sortLabel")}
      value={sort}
      onValueChange={update}
      className="w-full sm:w-auto"
      options={ENVELOPE_SORT_VALUES.map((value: EnvelopeSort) => ({
        value,
        label: t(`sorts.${value}`),
      }))}
    />
  );
};

export const EnvelopesFilter = ({ actions }: { actions?: React.ReactNode }) => {
  return (
    <ListFilterBar
      actions={actions}
      filters={
        <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
          <div className="col-span-2 sm:contents">
            <EnvelopesStatusFilter />
          </div>
          <EnvelopesSortFilter />
          <EnvelopesPageSizeFilter />
        </div>
      }
      renderSearch={(className) => <EnvelopesSearch className={className} />}
    />
  );
};
