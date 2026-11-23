"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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
  const [, startTransition] = useTransition();

  const timeoutRef = useRef<number | null>(null);
  const urlValue = searchParams.get(param) ?? "";
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

  // Keep latest searchParams in a ref so delayed writes never revert concurrent filter changes.
  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

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
      const params = new URLSearchParams(searchParamsRef.current);
      writeParam(params, next);

      startTransition(() => {
        const query = params.toString();
        router.replace(`${pathname}${query ? `?${query}` : ""}`);
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
