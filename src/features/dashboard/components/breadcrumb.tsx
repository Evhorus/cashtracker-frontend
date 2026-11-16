"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";

import { DASHBOARD_NAV_ITEMS } from "@/features/dashboard/constants/nav-items";

export interface BreadcrumbLink {
  href: string;
  label: string;
}

/**
 * The trail to a page nested below a nav destination - an envelope, an
 * expense - sitting opposite its title (see PageHeader).
 *
 * Nav destinations themselves (Sobres, Categorías, Estadísticas...) get
 * none: the menu already says where you are, so "Resumen › Sobres" told
 * nothing. The trail starts at the section for the same reason.
 *
 * The section comes from the pathname, its label from
 * DASHBOARD_NAV_ITEMS. What lies between it and the leaf (the envelope
 * an expense belongs to) is data only the page has, so it comes in as
 * `parents`.
 */
interface BreadcrumbProps {
  /** The current page, rendered as plain text - you are already here. */
  current: string;
  /** Links between the section and the current page. */
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
  // The envelope detail route lives outside the /dashboard/envelopes
  // nav entry, so its section needs saying explicitly.
  const sectionLink: BreadcrumbLink | null = section
    ? { href: section.href, label: t(section.key) }
    : pathname.startsWith("/dashboard/envelope")
      ? { href: "/dashboard/envelopes", label: t("envelopes") }
      : null;

  const ancestors = [...(sectionLink ? [sectionLink] : []), ...parents];

  return (
    // Hidden below md by its callers: at 390px the header row already
    // carries the back arrow, which is the same affordance.
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
