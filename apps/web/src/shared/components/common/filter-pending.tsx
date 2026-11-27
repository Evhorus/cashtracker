"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const PENDING_SAFETY_TIMEOUT_MS = 16_000;

export function canonicalizeUrl(
  pathname: string,
  params: URLSearchParams,
): string {
  const entries = [...params.entries()].sort(
    ([keyA, valA], [keyB, valB]) =>
      keyA.localeCompare(keyB) || valA.localeCompare(valB),
  );
  const normalized = new URLSearchParams(entries);
  const qs = normalized.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export function canonicalizeHref(href: string): string {
  const queryIndex = href.indexOf("?");
  if (queryIndex === -1) return href;
  return canonicalizeUrl(
    href.slice(0, queryIndex),
    new URLSearchParams(href.slice(queryIndex + 1)),
  );
}

interface PendingTarget {
  canonical: string;
  query: string;
  pathname: string;
}

interface PendingDraft {
  params: URLSearchParams;
  baseLiveCanonical: string;
  pathname: string;
}

export interface UpdateParamsOptions {
  debounceMs?: number;
  resetPage?: boolean;
}

export interface FilterPendingContextValue {
  isPending: boolean;
  effectiveSearchParams: URLSearchParams;
  updateParams: (
    mutate: (params: URLSearchParams) => void,
    options?: UpdateParamsOptions,
  ) => void;
  flush: () => void;
  markPendingHref: (href: string) => void;
}

const FilterPendingContext = createContext<FilterPendingContextValue | null>(
  null,
);

export function FilterPendingProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState<PendingTarget | null>(null);

  const liveQuery = searchParams.toString();
  const liveCanonical = canonicalizeUrl(
    pathname,
    new URLSearchParams(liveQuery),
  );

  // Clear pending state during render as soon as the router URL catches up or changes route.
  if (
    pending !== null &&
    (pending.pathname !== pathname || pending.canonical === liveCanonical)
  ) {
    setPending(null);
  }

  const isPending =
    pending !== null &&
    pending.pathname === pathname &&
    pending.canonical !== liveCanonical;

  const effectiveQuery = isPending && pending ? pending.query : liveQuery;
  const effectiveSearchParams = useMemo(
    () => new URLSearchParams(effectiveQuery),
    [effectiveQuery],
  );

  const liveQueryRef = useRef(liveQuery);
  const liveCanonicalRef = useRef(liveCanonical);
  const pathnameRef = useRef(pathname);
  const pendingDraftRef = useRef<PendingDraft | null>(null);
  const pendingHrefRef = useRef<string | null>(null);
  const debounceTimerRef = useRef<number | null>(null);
  const safetyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    liveQueryRef.current = liveQuery;
    liveCanonicalRef.current = liveCanonical;
    pathnameRef.current = pathname;
  }, [liveQuery, liveCanonical, pathname]);

  const clearDebounce = () => {
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  };

  const clearSafety = () => {
    if (safetyTimerRef.current !== null) {
      window.clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
  };

  const armSafetyTimer = () => {
    clearSafety();
    safetyTimerRef.current = window.setTimeout(() => {
      safetyTimerRef.current = null;
      pendingDraftRef.current = null;
      pendingHrefRef.current = null;
      setPending(null);
    }, PENDING_SAFETY_TIMEOUT_MS);
  };

  const commitNow = () => {
    clearDebounce();
    const href = pendingHrefRef.current;
    pendingHrefRef.current = null;
    if (!href) return;
    armSafetyTimer();
    router.replace(href, { scroll: false });
  };

  useEffect(() => {
    if (pending === null) {
      clearSafety();
      pendingDraftRef.current = null;
      pendingHrefRef.current = null;
    }
  }, [pending]);

  useEffect(() => {
    const handlePopState = () => {
      clearDebounce();
      clearSafety();
      pendingDraftRef.current = null;
      pendingHrefRef.current = null;
      setPending(null);
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      clearDebounce();
      clearSafety();
    };
  }, []);

  const updateParams = (
    mutate: (params: URLSearchParams) => void,
    options?: UpdateParamsOptions,
  ) => {
    const currentPathname = pathnameRef.current;
    const currentLiveCanonical = liveCanonicalRef.current;
    const draft = pendingDraftRef.current;
    const base =
      draft &&
      draft.pathname === currentPathname &&
      draft.baseLiveCanonical === currentLiveCanonical
        ? new URLSearchParams(draft.params)
        : new URLSearchParams(liveQueryRef.current);

    mutate(base);
    if (options?.resetPage !== false) {
      base.delete("page");
    }

    const nextCanonical = canonicalizeUrl(currentPathname, base);
    if (nextCanonical === currentLiveCanonical) {
      clearDebounce();
      clearSafety();
      pendingDraftRef.current = null;
      pendingHrefRef.current = null;
      setPending(null);
      return;
    }

    const query = base.toString();
    const href = query ? `${currentPathname}?${query}` : currentPathname;
    pendingDraftRef.current = {
      params: base,
      baseLiveCanonical: currentLiveCanonical,
      pathname: currentPathname,
    };
    pendingHrefRef.current = href;
    setPending({
      canonical: nextCanonical,
      query,
      pathname: currentPathname,
    });

    clearDebounce();
    const debounceMs = options?.debounceMs ?? 0;
    if (debounceMs > 0) {
      debounceTimerRef.current = window.setTimeout(commitNow, debounceMs);
    } else {
      commitNow();
    }
  };

  const flush = () => {
    if (debounceTimerRef.current !== null) {
      commitNow();
    }
  };

  const markPendingHref = (href: string) => {
    const queryIndex = href.indexOf("?");
    const targetPathname = queryIndex === -1 ? href : href.slice(0, queryIndex);
    const targetQuery = queryIndex === -1 ? "" : href.slice(queryIndex + 1);
    const targetCanonical = canonicalizeUrl(
      targetPathname,
      new URLSearchParams(targetQuery),
    );
    if (targetCanonical === liveCanonicalRef.current) return;

    clearDebounce();
    pendingDraftRef.current = null;
    pendingHrefRef.current = null;
    armSafetyTimer();
    setPending({
      canonical: targetCanonical,
      query: targetQuery,
      pathname: targetPathname,
    });
  };

  const value: FilterPendingContextValue = {
    isPending,
    effectiveSearchParams,
    updateParams,
    flush,
    markPendingHref,
  };

  return (
    <FilterPendingContext.Provider value={value}>
      {children}
    </FilterPendingContext.Provider>
  );
}

export function useOptionalFilterPending(): FilterPendingContextValue | null {
  return useContext(FilterPendingContext);
}

export function useFilterPending(): FilterPendingContextValue {
  const ctx = useContext(FilterPendingContext);
  if (!ctx) {
    throw new Error(
      "useFilterPending must be used inside a FilterPendingProvider.",
    );
  }
  return ctx;
}

export function FilterResultsSlot({
  fallback,
  children,
  className,
}: {
  fallback: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const { isPending } = useFilterPending();
  return (
    <div aria-busy={isPending || undefined} className={className}>
      {isPending ? fallback : children}
    </div>
  );
}
