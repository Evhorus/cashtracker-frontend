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
}

export const PageHeader = ({
  title,
  description,
  backUrl,
  actions,
  mobileActions,
}: PageHeaderProps) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {backUrl && (
          <Link href={backUrl}>
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

        <div>
          <h1 className="truncate text-2xl font-bold tracking-tight md:text-3xl">
            {title}
          </h1>
          {description && (
            <div className="flex items-center gap-2 text-muted-foreground">
              {description}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {actions && <div className="hidden gap-2 md:flex">{actions}</div>}
        {mobileActions && <div className="md:hidden">{mobileActions}</div>}
      </div>
    </div>
  );
};
