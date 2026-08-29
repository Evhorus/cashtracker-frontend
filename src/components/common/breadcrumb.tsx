"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";

import { DASHBOARD_NAV_ITEMS } from "./nav-items";

/**
 * The trail to the current page, sitting opposite its title (see
 * PageHeader) - the shape TailAdmin and most dashboard kits use.
 *
 * Derived from the pathname rather than passed in page by page: the
 * ancestors are all nav destinations, whose labels already live in
 * DASHBOARD_NAV_ITEMS, so asking each page to restate them would be a
 * second copy that can drift. The leaf is the page's own `title`, which
 * PageHeader already has - and which is the only part this cannot know,
 * since it can be an envelope's name.
 */
interface BreadcrumbProps {
  /** The current page, rendered as plain text - you are already here. */
  current: string;
  className?: string;
}

const SUMMARY_HREF = "/dashboard";

export function Breadcrumb({ current, className }: BreadcrumbProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  // The summary page IS the root, so it has no trail of its own.
  if (pathname === SUMMARY_HREF) return null;

  const section = DASHBOARD_NAV_ITEMS.find(
    (item) => item.href !== SUMMARY_HREF && pathname.startsWith(item.href),
  );

  const ancestors = [{ href: SUMMARY_HREF, label: t("summary") }];

  if (section) {
    // A nav destination itself is the leaf, not its own ancestor.
    if (pathname !== section.href) {
      ancestors.push({ href: section.href, label: t(section.key) });
    }
  } else if (pathname.startsWith("/dashboard/envelope")) {
    // The envelope detail route lives outside the /dashboard/envelopes
    // nav entry, so its parent needs saying explicitly.
    ancestors.push({ href: "/dashboard/envelopes", label: t("envelopes") });
  }

  return (
    // Hidden below md: at 390px this row already carries the back arrow,
    // the title and the create action, and the back arrow is the same
    // affordance a breadcrumb would provide.
    <nav aria-label={t("breadcrumb")} className={className}>
      <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {ancestors.map((ancestor) => (
          <li key={ancestor.href} className="flex items-center gap-1.5">
            <Link
              href={ancestor.href}
              className="transition-colors hover:text-foreground"
            >
              {ancestor.label}
            </Link>
            <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
          </li>
        ))}
        {/* aria-current, and not a link: this is where the reader is. */}
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
