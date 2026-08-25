"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

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
}

export const PageHeader = ({
  title,
  description,
  backUrl,
  actions,
  mobileActions,
  icon,
}: PageHeaderProps) => {
  return (
    // items-start, not items-center: a title long enough to wrap (see the
    // min-w-0 comment below) would otherwise center the back button and
    // actions against the whole multi-line block, leaving them floating
    // next to the middle line instead of lined up with the first one.
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {backUrl && (
          // md:hidden - desktop already has the persistent sidebar nav
          // (dashboard-sidebar.tsx) to get anywhere else in the app, so a
          // "go back" affordance here is redundant there. Mobile has no
          // such persistent nav next to the content, just the bottom tab
          // bar (Resumen/Sobres/Estadísticas/Cuenta, no "back" of its
          // own), so it's the one place this button actually earns its
          // spot.
          <Link href={backUrl} className="md:hidden">
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
              className="h-10 w-10 shrink-0 rounded-full border border-border/60 bg-card/50 text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/10 dark:hover:text-primary"
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
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight break-words md:text-3xl">
            {title}
          </h1>
          {description && (
            <div className="flex items-center gap-2 text-muted-foreground">
              {description}
            </div>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-start gap-2">
        {actions && <div className="hidden gap-2 md:flex">{actions}</div>}
        {mobileActions && <div className="md:hidden">{mobileActions}</div>}
      </div>
    </div>
  );
};
