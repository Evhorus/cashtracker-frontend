"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/button";
import {
  Breadcrumb,
  type BreadcrumbLink,
} from "@/features/dashboard/components/breadcrumb";
import { Heading } from "@/shared/components/common/typography";
import { cn } from "@/shared/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  backUrl?: string;
  actions?: ReactNode;
  mobileActions?: ReactNode;
  /** Optional leading visual before the title - e.g. the envelope's
   * category icon on envelope/[envelopeId]/page.tsx. Most callers don't
   * pass this. */
  icon?: ReactNode;
  /** Breadcrumb links between the section and this page - see
   * Breadcrumb. */
  breadcrumbParents?: BreadcrumbLink[];
}

export const PageHeader = ({
  title,
  description,
  backUrl,
  actions,
  mobileActions,
  icon,
  breadcrumbParents,
}: PageHeaderProps) => {
  const t = useTranslations("common");
  return (
    <div className="space-y-4">
      {/* items-start, not items-center: a title long enough to wrap (see
          the min-w-0 comment below) would otherwise center the back
          button against the whole multi-line block, leaving it floating
          next to the middle line instead of lined up with the first
          one. */}
      {/* With an icon (the envelope and expense detail pages), phones
          give the title a row of its own: beside the back button, the
          icon and the actions it had ~130px at 320px wide, and a long
          envelope name wrapped over eight lines. `contents` lets the
          inner group's children join this row, so the title can be
          ordered last and take the full width. */}
      <div
        className={cn(
          "flex items-start justify-between gap-4",
          icon && "max-md:flex-wrap max-md:justify-start max-md:gap-3",
        )}
      >
        <div
          className={cn(
            "flex min-w-0 flex-1 items-start gap-3",
            icon && "max-md:contents",
          )}
        >
          {backUrl && (
            // md:hidden - desktop already has the persistent sidebar nav
            // (dashboard-sidebar.tsx) to get anywhere else in the app, so a
            // "go back" affordance here is redundant there. Mobile has no
            // such persistent nav next to the content, just the bottom tab
            // bar (Resumen/Sobres/Estadísticas/Cuenta, no "back" of its
            // own), so it's the one place this button actually earns its
            // spot. (Desktop's way back from a nested detail view is the
            // breadcrumb's section link.)
            <Link href={backUrl} aria-label={t("back")} className="md:hidden">
              {/* Same rounded/translucent-card/subtle-border treatment as
                the nav-pill groups elsewhere (custom-header.tsx's
                Dashboard/Sobres pills, account-view.tsx's settings
                sidebar) - a plain neutral-outline circle read as
                disconnected from the rest of the app's chrome. Hover
                nudges toward the primary accent those pills use too,
                instead of the generic gray hover every outline button
                gets. */}
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0 rounded-full border border-border/60 bg-card/50 text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
          )}

          {icon && <div className="shrink-0">{icon}</div>}

          {/* min-w-0 is what actually lets this shrink below the title's
            natural content width inside the flex row above - without it
            the title just grows the row wide instead of wrapping,
            pushing the actions off to the side (or under them, at long
            enough names). No truncate here on purpose: an envelope name
            long enough to hit this is still information the user typed
            in and needs to read in full, not hide behind an ellipsis -
            same criterion as sessions-section.tsx and
            envelope-card.tsx's meta line. */}
          <div
            className={cn(
              "min-w-0 flex-1",
              icon && "max-md:order-last max-md:basis-full",
            )}
          >
            <Heading as="h1" size="lg">
              {title}
            </Heading>
            {description && (
              <div className="flex flex-wrap items-center gap-x-2 text-muted-foreground">
                {description}
              </div>
            )}
          </div>
        </div>

        {/* One band for the whole header: on desktop the trail and the
            actions stack opposite the title, rather than the actions
            taking a row of their own underneath and leaving the space
            beside the title empty. No "Volver" here on desktop - the
            breadcrumb's section link is the way back. */}
        <div
          className={cn(
            "flex shrink-0 items-center gap-4 md:flex-col md:items-end md:gap-3",
            icon && "max-md:ml-auto",
          )}
        >
          <Breadcrumb
            current={title}
            parents={breadcrumbParents}
            className="hidden md:block"
          />

          {actions && (
            <div className="hidden items-center gap-2 md:flex">{actions}</div>
          )}

          {/* Mobile's actions stay beside the title: there is no
              breadcrumb to share the row with, and an icon-only button
              fits where a labelled row would not. */}
          {mobileActions && <div className="md:hidden">{mobileActions}</div>}
        </div>
      </div>
    </div>
  );
};
