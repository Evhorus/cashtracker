"use client";

import type * as React from "react";

import { useOptionalFilterPending } from "@/shared/components/common/filter-pending";
import { scrollAppToTop } from "@/shared/components/common/scroll-to-top";
import {
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/components/ui/pagination";

function usePaginationClickHandler(
  href: string,
  onClick?: React.MouseEventHandler<HTMLAnchorElement>,
) {
  const filterPending = useOptionalFilterPending();

  return (event: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    filterPending?.markPendingHref(href);
    scrollAppToTop();
  };
}

export function PaginationNavLink({
  href,
  onClick,
  ...props
}: Omit<React.ComponentProps<typeof PaginationLink>, "href"> & {
  href: string;
}) {
  const handleClick = usePaginationClickHandler(href, onClick);
  return <PaginationLink href={href} onClick={handleClick} {...props} />;
}

export function PaginationNavPrevious({
  href,
  onClick,
  ...props
}: Omit<React.ComponentProps<typeof PaginationPrevious>, "href"> & {
  href: string;
}) {
  const handleClick = usePaginationClickHandler(href, onClick);
  return <PaginationPrevious href={href} onClick={handleClick} {...props} />;
}

export function PaginationNavNext({
  href,
  onClick,
  ...props
}: Omit<React.ComponentProps<typeof PaginationNext>, "href"> & {
  href: string;
}) {
  const handleClick = usePaginationClickHandler(href, onClick);
  return <PaginationNext href={href} onClick={handleClick} {...props} />;
}
