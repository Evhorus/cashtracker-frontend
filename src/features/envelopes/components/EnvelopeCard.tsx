import { Button } from "@/components/common/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/common/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/format-currency";
import { ArrowRight, Infinity as InfinityIcon, Wallet } from "lucide-react";

import Link from "next/link";
import { useMemo } from "react";
import React from "react";
import { EnvelopeHelpers } from "@/features/envelopes/lib/envelope-helpers";
import { Envelope } from "@/features/envelopes/types";
import { UpdateEnvelopeDialog } from "./UpdateEnvelopeDialog";
import { DeleteEnvelopeAlertDialog } from "./DeleteEnvelopeAlertDialog";
import { EnvelopeActionsMenu } from "./EnvelopeActionsMenu";

interface EnvelopeCardProps {
  envelope: Envelope;
}

export const EnvelopeCard = React.memo(({ envelope }: EnvelopeCardProps) => {
  const envelopeId = envelope.id;

  const calculations = useMemo(() => {
    const status = EnvelopeHelpers.getProgressStatus(envelope);
    return {
      remaining: EnvelopeHelpers.getRemaining(envelope),
      percentage: EnvelopeHelpers.getPercentage(envelope),
      status,
      isExceeded: status === "exceeded",
      isWarning: status === "warning",
      isUnlimited: status === "unlimited",
    };
  }, [envelope]);

  const progressColorClass = calculations.isExceeded
    ? "[&>div]:bg-destructive"
    : calculations.isWarning
      ? "[&>div]:bg-amber-500"
      : "[&>div]:bg-primary";

  const amountTextColorClass = calculations.isExceeded
    ? "text-destructive"
    : calculations.isWarning
      ? "text-amber-500"
      : "text-primary";

  return (
    <Card className="group relative overflow-hidden border-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-card hover:shadow-lg">
      <div className="absolute top-0 bottom-0 left-0 w-1 bg-primary/60 transition-colors duration-300 group-hover:bg-primary" />

      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-transparent to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <CardHeader className="relative z-10 flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm transition-transform duration-300 group-hover:scale-110">
            <Wallet className="h-5 w-5" />
          </div>

          <div className="space-y-1">
            <CardTitle className="text-lg leading-none font-bold tracking-tight transition-colors duration-200 group-hover:text-primary">
              <span className="block max-w-37.5 truncate sm:max-w-50">
                {envelope.name}
              </span>
            </CardTitle>
            {envelope.category && (
              <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                {envelope.category}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center">
          {/* Desktop Actions */}
          <div className="hidden translate-x-2 items-center gap-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 md:flex">
            <UpdateEnvelopeDialog envelope={envelope} />
            <DeleteEnvelopeAlertDialog id={envelope.id} name={envelope.name} />
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden">
            <div data-no-nav>
              <EnvelopeActionsMenu envelope={envelope} />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-5">
        {calculations.isUnlimited ? (
          <div className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2">
            <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <InfinityIcon className="h-4 w-4" />
              Sin límite
            </span>
            <span className="text-sm font-bold text-foreground">
              {formatCurrency(+envelope.spent)} gastado
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-end justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Progreso
              </span>
              <span className={`text-sm font-bold ${amountTextColorClass}`}>
                {Math.min(calculations.percentage ?? 0, 100).toFixed(0)}%
              </span>
            </div>
            <Progress
              value={Math.min(calculations.percentage ?? 0, 100)}
              className={`h-2.5 rounded-full bg-secondary/50 ${progressColorClass}`}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Gastado</p>
            <p className={`text-sm font-bold ${amountTextColorClass}`}>
              {formatCurrency(+envelope.spent)}
            </p>
          </div>
          {!calculations.isUnlimited && (
            <div className="space-y-1 text-right">
              <p className="text-xs font-medium text-muted-foreground">
                Disponible
              </p>
              <p
                className={`text-sm font-bold ${
                  (calculations.remaining ?? 0) < 0
                    ? "text-destructive"
                    : "text-success"
                }`}
              >
                {formatCurrency(calculations.remaining ?? 0)}
              </p>
            </div>
          )}
        </div>

        <Button
          asChild
          variant="ghost"
          className="group/btn h-auto w-full justify-between px-0 py-2 font-medium hover:bg-primary/5 hover:text-primary"
        >
          <Link href={`/dashboard/envelope/${envelopeId}`}>
            <span className="ml-1">Ver detalles</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 transition-all duration-300 group-hover/btn:bg-primary group-hover/btn:text-primary-foreground">
              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
            </div>
          </Link>
        </Button>
      </CardContent>

      {/* Status Badge */}
      {calculations.isExceeded && (
        <div className="absolute right-0 bottom-0 left-0 h-1 bg-destructive/50" />
      )}
    </Card>
  );
});

EnvelopeCard.displayName = "EnvelopeCard";
