import { ChartNoAxesColumn, Home, Tag, UserRound, Wallet } from "lucide-react";

/** Shared nav items; `key` maps to the `nav` i18n namespace (`as const` enables compile-time key checking). */
export const DASHBOARD_NAV_ITEMS = [
  { key: "summary", href: "/dashboard", icon: Home },
  { key: "envelopes", href: "/dashboard/envelopes", icon: Wallet },
  { key: "categories", href: "/dashboard/categories", icon: Tag },
  { key: "statistics", href: "/dashboard/statistics", icon: ChartNoAxesColumn },
  { key: "account", href: "/dashboard/account", icon: UserRound },
] as const;

/** Excludes "account" (reachable from the avatar); DASHBOARD_NAV_ITEMS retains it for breadcrumbs. */
export const MAIN_NAV_ITEMS = DASHBOARD_NAV_ITEMS.filter(
  (item) => item.key !== "account",
);

/** Matches `/dashboard/envelope/[id]` (singular) under the Envelopes nav item. */
export function isNavItemActive(itemHref: string, pathname: string): boolean {
  if (itemHref === "/dashboard") return pathname === itemHref;
  if (itemHref === "/dashboard/envelopes") {
    return (
      pathname.startsWith("/dashboard/envelopes") ||
      pathname.startsWith("/dashboard/envelope/")
    );
  }
  return pathname.startsWith(itemHref);
}
