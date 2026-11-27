"use client";

import type { ReactNode } from "react";
import { useLinkStatus } from "next/link";

import { cn } from "@/shared/lib/utils";

/** Fixed-size pending dot delayed 100ms via CSS so fast prefetched navigations never flash. */
export function LinkPendingIndicator({ className }: { className?: string }) {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden="true"
      data-pending={pending ? "true" : undefined}
      className={cn("link-pending-dot", className)}
    />
  );
}

/** Zero-width pending opacity pulse for tight layouts (e.g. 320px bottom nav). */
export function LinkPendingPulse({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { pending } = useLinkStatus();
  return (
    <span
      data-pending={pending ? "true" : undefined}
      className={cn("link-pending-pulse contents", className)}
    >
      {children}
    </span>
  );
}
