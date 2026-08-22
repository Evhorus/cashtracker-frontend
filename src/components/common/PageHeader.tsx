"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";
import { Button } from "@/components/common/button";

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
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full border-muted-foreground/20"
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
