import { ChartNoAxesColumn, Home, Tag, UserRound, Wallet } from "lucide-react";

/**
 * The dashboard's navigation, in order. One list rather than the copy
 * each of DashboardSidebar and MobileNav used to keep - they had
 * already drifted into two literals that had to be edited in lockstep.
 *
 * `key` is a message key under the `nav` namespace, not a label: the
 * words are per-language, the routes aren't. `as const` is what lets
 * next-intl check those keys against the catalogue at build time.
 */
export const DASHBOARD_NAV_ITEMS = [
  { key: "summary", href: "/dashboard", icon: Home },
  { key: "envelopes", href: "/dashboard/envelopes", icon: Wallet },
  { key: "categories", href: "/dashboard/categories", icon: Tag },
  { key: "statistics", href: "/dashboard/statistics", icon: ChartNoAxesColumn },
  { key: "account", href: "/dashboard/account", icon: UserRound },
] as const;

/**
 * What the sidebar and the mobile bottom bar list. Account is left out
 * of both: it is already one tap away from the avatar (the user card at
 * the foot of the sidebar, the avatar menu in the mobile header), so a
 * second link to it was redundant. DASHBOARD_NAV_ITEMS keeps it for the
 * breadcrumb's page names.
 */
export const MAIN_NAV_ITEMS = DASHBOARD_NAV_ITEMS.filter(
  (item) => item.key !== "account",
);
