"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useOptionalFilterPending } from "@/shared/components/common/filter-pending";

interface UseDebouncedSearchParamOptions {
  param?: string;
  delayMs?: number;
}

export interface DebouncedSearchParam {
  value: string;
  onChange: (value: string) => void;
  /** Writes the live value into `params` and cancels any pending debounce before another filter navigates. */
  applyTo: (params: URLSearchParams) => void;
}

/** Debounced URL-backed search input that stays synced with external URL changes without clobbering active typing. */
export function useDebouncedSearchParam({
  param = "search",
  delayMs = 500,
}: UseDebouncedSearchParamOptions = {}): DebouncedSearchParam {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filterPending = useOptionalFilterPending();

  const timeoutRef = useRef<number | null>(null);
  const urlValue =
    (filterPending
      ? filterPending.effectiveSearchParams.get(param)
      : searchParams.get(param)) ?? "";
  const [value, setValue] = useState(urlValue);
  const [syncedUrlValue, setSyncedUrlValue] = useState(urlValue);
  const [committedValue, setCommittedValue] = useState(urlValue);
  const [externalSyncToken, setExternalSyncToken] = useState(0);

  if (urlValue !== syncedUrlValue) {
    setSyncedUrlValue(urlValue);
  }
  // Sync local input when URL changes externally (e.g. Clear filters or Back/Forward), ignoring our own replace.
  if (urlValue !== syncedUrlValue && urlValue !== committedValue) {
    setCommittedValue(urlValue);
    setValue(urlValue);
    setExternalSyncToken((token) => token + 1);
  }

  // Keep latest searchParams and filterPending in refs so delayed writes never revert concurrent filter changes.
  const searchParamsRef = useRef(searchParams);
  const filterPendingRef = useRef(filterPending);
  useEffect(() => {
    searchParamsRef.current = searchParams;
    filterPendingRef.current = filterPending;
  }, [searchParams, filterPending]);

  const cancelPending = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (externalSyncToken > 0) {
      cancelPending();
    }
  }, [externalSyncToken]);

  useEffect(() => cancelPending, []);

  const writeParam = (params: URLSearchParams, next: string) => {
    if (next) {
      params.set(param, next);
    } else {
      params.delete(param);
    }
    params.delete("page");
  };

  const onChange = (next: string) => {
    setValue(next);
    cancelPending();

    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null;
      setCommittedValue(next);
      const pending = filterPendingRef.current;
      if (pending) {
        pending.updateParams((params) => writeParam(params, next));
        return;
      }
      const params = new URLSearchParams(searchParamsRef.current);
      writeParam(params, next);
      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}`, {
        scroll: false,
      });
    }, delayMs);
  };

  const applyTo = (params: URLSearchParams) => {
    cancelPending();
    setCommittedValue(value);
    writeParam(params, value);
  };

  return { value, onChange, applyTo };
}
