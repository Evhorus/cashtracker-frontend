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
 * The mobile bottom bar has room for four, and account is already one
 * tap away from the avatar menu in the header - so it's the one that
 * gives up its slot.
 */
export const MOBILE_NAV_ITEMS = DASHBOARD_NAV_ITEMS.filter(
  (item) => item.key !== "account",
);
