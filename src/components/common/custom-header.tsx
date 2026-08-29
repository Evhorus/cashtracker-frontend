"use client";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { AccountMenu } from "@/features/account/components/account-menu";
import { Heading } from "./typography";
import { Logo } from "./logo";
import { ModeToggle } from "./mode-toggle";
import { DASHBOARD_NAV_ITEMS } from "./nav-items";
import { LocaleToggle } from "@/features/locale/components/locale-toggle";

/**
 * Which section the reader is in, from the nav list rather than a second
 * table of names - the same source the sidebar labels itself from, so the
 * two cannot disagree.
 *
 * Longest match wins, and a detail route resolves to its parent: on
 * /dashboard/envelope/:id this reads "Sobres", which is true and is what
 * the sidebar highlights. "/dashboard" alone has to be exact or it would
 * match everything.
 */
function useSectionTitle(): { title: string | null; isSectionRoot: boolean } {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const match = [...DASHBOARD_NAV_ITEMS]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) =>
      item.href === "/dashboard"
        ? pathname === item.href
        : pathname.startsWith(item.href),
    );

  // The envelope detail route lives at /dashboard/envelope/:id, outside
  // the /dashboard/envelopes nav entry, so it needs saying explicitly.
  if (!match && pathname.startsWith("/dashboard/envelope")) {
    return { title: t("envelopes"), isSectionRoot: false };
  }

  return {
    title: match ? t(match.key) : null,
    // Whether this IS the page's title or just says which section the
    // page belongs to. On a section root it is the title, and the page
    // hides its own copy above `md`, so this has to be the <h1> - the
    // accessible heading has to live somewhere. On a detail route the
    // page keeps its own <h1> (the envelope or expense name), so this is
    // context and renders as plain text rather than a second heading.
    isSectionRoot: Boolean(match) && pathname === match?.href,
  };
}

/**
 * The dashboard's top bar, at every breakpoint.
 *
 * The theme and language toggles live here rather than in the sidebar.
 * They were crammed into the sidebar's 248px header row next to the
 * logo, which is both tight and the wrong place: they are app-wide
 * chrome, not navigation.
 *
 * Branding and account access are duplicated in the sidebar on desktop,
 * so this only renders them below `md` - otherwise the same avatar and
 * the same logo would appear twice on one screen. Above `md` the space
 * they leave carries the current section instead of sitting empty.
 *
 * Per-page actions are NOT here - those belong to the page's own
 * controls row (see ListFilterBar) or to PageHeader.
 */
export const CustomHeader = () => {
  const { title, isSectionRoot } = useSectionTitle();

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Sidebar owns the logo on desktop. */}
        <div className="md:hidden">
          <Logo href="/dashboard" />
        </div>

        {/* On a section root this IS the page title, so it renders at
            the page-title size through Heading (not hand-copied classes)
            and is the document's h1. On a detail route it is context for
            a page that has its own title, so it reads as a quiet
            breadcrumb instead - same words, deliberately not the same
            weight. */}
        {title &&
          (isSectionRoot ? (
            <Heading as="h1" size="lg" className="hidden truncate md:block">
              {title}
            </Heading>
          ) : (
            <p className="hidden truncate text-sm text-muted-foreground md:block">
              {title}
            </p>
          ))}

        {/* Pushes the toggles to the right whatever is on the left. */}
        <div className="ml-auto flex items-center gap-4">
          <LocaleToggle />
          <ModeToggle />
          {/* Sidebar owns the account menu on desktop. */}
          <div className="md:hidden">
            <AccountMenu />
          </div>
        </div>
      </div>
    </header>
  );
};
