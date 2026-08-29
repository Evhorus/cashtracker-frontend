import Link from "next/link";
import { Infinity as InfinityIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Envelope } from "@/features/envelopes/types";
import { EnvelopeHelpers } from "@/features/envelopes/lib/envelope-helpers";
import { CURRENCY_MAP, formatCurrency } from "@/lib/format-currency";
import { cn } from "@/lib/utils";
import {
  CategoryIcon,
  CategoryLabel,
} from "@/features/categories/components/category-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CardHoverActions } from "@/components/common/card-hover-actions";
import { UpdateEnvelopeDialog } from "./update-envelope-dialog";
import { DeleteEnvelopeAlertDialog } from "./delete-envelope-alert-dialog";
import { EnvelopeStatusBadge } from "./envelope-status-badge";

interface EnvelopesTableProps {
  envelopes: Envelope[];
}

// Desktop-only (see envelopes-grid.tsx - the card grid still covers
// mobile). A dense data table instead of a stretched-out card grid is
// the one piece of the redesign mockup that most says "this is built for
// a desktop power user, not a phone screen scaled up". Built on the
// shadcn Table primitives (components/ui/table.tsx) rather than raw
// <table> markup, with their stock styling overridden to match this
// app's own standard (rounded-2xl border card, uppercase header, px-5
// py-3.5 cells) instead of shadcn's defaults - see categories-table.tsx
// for the same treatment.
export function EnvelopesTable({ envelopes }: EnvelopesTableProps) {
  const t = useTranslations("envelopes.table");

  return (
    <div className="hidden overflow-hidden rounded-2xl border border-border/60 bg-card/30 md:block">
      <Table className="min-w-max text-sm">
        <TableHeader>
          <TableRow className="border-border/60 bg-card/60 text-xs font-semibold tracking-wider text-muted-foreground uppercase hover:bg-card/60">
            <TableHead className="h-auto px-5 py-3 text-left font-semibold text-inherit">
              {t("envelope")}
            </TableHead>
            <TableHead className="h-auto px-5 py-3 text-left font-semibold text-inherit">
              {t("category")}
            </TableHead>
            <TableHead className="h-auto px-5 py-3 text-left font-semibold text-inherit">
              {t("progress")}
            </TableHead>
            <TableHead className="h-auto px-5 py-3 text-right font-semibold text-inherit">
              {t("spent")}
            </TableHead>
            <TableHead className="h-auto px-5 py-3 text-right font-semibold text-inherit">
              {t("available")}
            </TableHead>
            <TableHead className="h-auto px-5 py-3 text-right font-semibold text-inherit">
              {t("status")}
            </TableHead>
            <TableHead className="h-auto px-5 py-3" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {envelopes.map((envelope) => {
            const status = envelope.status;
            const percentage = EnvelopeHelpers.getPercentage(envelope);
            const remaining = EnvelopeHelpers.getRemaining(envelope);
            const currencyConfig = CURRENCY_MAP[envelope.currency];
            const barColorClass =
              EnvelopeHelpers.getStatusBarColorClass(status);

            return (
              <TableRow key={envelope.id} className="group border-border/60">
                <TableCell className="px-5 py-3.5">
                  <Link
                    href={`/dashboard/envelope/${envelope.id}`}
                    className="flex min-w-0 items-center gap-3"
                  >
                    <CategoryIcon
                      category={envelope.category}
                      className="h-9 w-9 rounded-lg"
                    />
                    <span className="truncate font-medium hover:text-primary">
                      {envelope.name}
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="px-5 py-3.5">
                  {envelope.category ? (
                    <CategoryLabel
                      category={envelope.category}
                      className="text-xs"
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="px-5 py-3.5">
                  {status === "unlimited" ? (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <InfinityIcon className="h-3.5 w-3.5" />
                      {t("noLimit")}
                    </span>
                  ) : (
                    <div className="flex items-center gap-2.5">
                      {/* Decorative: the same percentage is spelled out
                          in the text right next to it, so a
                          role="progressbar" here would just make a
                          screen reader announce it twice. */}
                      <div
                        aria-hidden="true"
                        className="h-1.5 w-24 shrink-0 overflow-hidden rounded-full bg-secondary/60"
                      >
                        <div
                          className={cn("h-full rounded-full", barColorClass)}
                          style={{
                            width: `${Math.min(percentage ?? 0, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="font-mono text-xs font-semibold text-muted-foreground">
                        {(percentage ?? 0).toFixed(0)}%
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="px-5 py-3.5 text-right font-mono">
                  {formatCurrency(+envelope.spent, currencyConfig)}
                </TableCell>
                <TableCell className="px-5 py-3.5 text-right font-mono font-semibold">
                  {status === "unlimited" ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    <span
                      className={cn(
                        (remaining ?? 0) < 0
                          ? "text-destructive"
                          : "text-success",
                      )}
                    >
                      {formatCurrency(remaining ?? 0, currencyConfig)}
                    </span>
                  )}
                </TableCell>
                <TableCell className="px-5 py-3.5 text-right">
                  <EnvelopeStatusBadge status={status} />
                </TableCell>
                <TableCell className="px-5 py-3.5">
                  <CardHoverActions className="justify-end" alwaysVisible>
                    <UpdateEnvelopeDialog envelope={envelope} />
                    <DeleteEnvelopeAlertDialog
                      id={envelope.id}
                      name={envelope.name}
                    />
                  </CardHoverActions>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
