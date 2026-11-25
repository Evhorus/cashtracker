"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { DASHBOARD_NAV_ITEMS } from "@/features/dashboard/constants/nav-items";

export interface BreadcrumbLink {
  href: string;
  label: string;
}

/** Breadcrumb trail for pages nested below a nav section; section is inferred from pathname, intermediate links via `parents`. */
interface BreadcrumbProps {
  current: string;
  parents?: BreadcrumbLink[];
  className?: string;
}

export function Breadcrumb({
  current,
  parents = [],
  className,
}: BreadcrumbProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const isNavDestination = DASHBOARD_NAV_ITEMS.some(
    (item) => item.href === pathname,
  );
  if (isNavDestination) return null;

  const section = DASHBOARD_NAV_ITEMS.find(
    (item) => item.href !== "/dashboard" && pathname.startsWith(item.href),
  );
  // Envelope detail lives outside /dashboard/envelopes, so fall back to that section explicitly.
  const sectionLink: BreadcrumbLink | null = section
    ? { href: section.href, label: t(section.key) }
    : pathname.startsWith("/dashboard/envelope")
      ? { href: "/dashboard/envelopes", label: t("envelopes") }
      : null;

  const ancestors = [...(sectionLink ? [sectionLink] : []), ...parents];

  return (
    // Hidden below md by callers since mobile headers show a back arrow instead.
    <nav aria-label={t("breadcrumb")} className={className}>
      <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {ancestors.map((ancestor) => (
          <li key={ancestor.href} className="flex min-w-0 items-center gap-1.5">
            <Link
              href={ancestor.href}
              className="truncate transition-colors hover:text-foreground"
            >
              {ancestor.label}
            </Link>
            <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
          </li>
        ))}
        <li
          aria-current="page"
          className="truncate font-medium text-foreground"
        >
          {current}
        </li>
      </ol>
    </nav>
  );
}
